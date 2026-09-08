"""
Node — QUERY_REWRITER (Discovery loop).

Nhiệm vụ: tối ưu current_query cho Tool RAG mà không đổi user intent.
Lần đầu (chưa có feedback): pass-through user_query.
"""

from __future__ import annotations

#
# ====== nơi setup logging ======
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
#
#
from langchain_core.messages import HumanMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import build_rewrite_prompt
from backend.modules.ai.ai_assistant_service.app.utils.helpers import (
    extract_text_from_response,
    safe_json_loads,
    summarize_retrieval_history,
)
from backend.modules.ai.ai_assistant_service.app.utils import trace


def _collect_validation_feedback(state: AgentState) -> str:
    parts: list[str] = []

    dv = state.get("decision_validation") or {}
    if dv.get("status") == "INVALID" and dv.get("feedback"):
        parts.append(f"[decision] {dv['feedback']}")
    rv = state.get("result_validation") or {}

    if rv.get("should_retrieve_again") and rv.get("feedback"):
        parts.append(f"[result] {rv['feedback']}")
    decision = state.get("decision") or {}
    if str(decision.get("action") or "").upper() == "NEED_RETRIEVAL":
        reason = decision.get("reason") or "Agent yêu cầu retrieve tool khác."
        parts.append(f"[need_retrieval] {reason}")
        
    return "\n".join(parts)


async def rewrite_query_node(state: AgentState) -> dict:
    """
    Rewrite current_query cho retrieval.

    - Lần đầu / không feedback → giữ nguyên user_query.
    - Có INVALID / WRONG_TOOL → gọi LLM rewrite, tránh trùng query_history.
    """
    user_query = (state.get("user_query") or "").strip()
    current_query = (state.get("current_query") or user_query).strip()
    query_history = list(state.get("query_history") or [])
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)
    feedback = _collect_validation_feedback(state)

    trace.banner(
        "NODE 1 · QUERY_REWRITER",
        user_query=user_query,
        current_query=current_query,
        retrieval_iteration=f"{retrieval_iteration}/{max_retrieval}",
        has_feedback=feedback,
    )

    # Pass-through lần đầu
    if not feedback and not query_history:
        trace.step("Lần đầu — giữ nguyên user_query cho retrieval.")
        return {
            "current_query": user_query,
            "query_history": [user_query],
            "progress": "Đang phân tích yêu cầu...",
        }

    # Hết lượt discovery → giữ query hiện tại
    if retrieval_iteration >= max_retrieval:
        trace.warn("Đã hết MAX_RETRIEVAL_RETRIES — không rewrite thêm.")
        return {
            "current_query": current_query,
            "progress": "Đang tìm công cụ phù hợp...",
        }

    prompt = build_rewrite_prompt(
        user_query=user_query,
        current_query=current_query,
        query_history=query_history,
        validation_feedback=feedback,
        retrieval_history_summary=summarize_retrieval_history(
            state.get("retrieval_history")
        ),
    )

    llm = state["llm"]
    new_query = current_query
    try:
        trace.step("Đang gọi LLM Query Rewriter...")
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        raw = extract_text_from_response(response)
        parsed = safe_json_loads(raw) or {}
        candidate = str(parsed.get("current_query") or "").strip()
        if candidate:
            new_query = candidate
    except Exception:
        logger.exception("[Node:Rewriter] LLM lỗi — giữ current_query.")
        trace.warn("Rewriter lỗi — giữ query cũ.")

    # Chống loop A→B→A
    if new_query in query_history:
        trace.warn("Query trùng history — giữ current_query, không lặp.")
        new_query = current_query
        updated_history = query_history
    else:
        updated_history = query_history + [new_query]
        trace.step("Rewritten query: %s", new_query)

    return {
        "current_query": new_query,
        "query_history": updated_history,
        "retrieval_iteration": retrieval_iteration + 1,
        "progress": "Đang tìm công cụ phù hợp...",
        # Clear final flags nếu đang ở discovery lại
        "final_status": None,
        "final_message": None,
    }
