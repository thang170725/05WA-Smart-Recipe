"""
Node 1: QUERY_REWRITER (rewrite).

Nhiệm vụ:
- retrieval_iteration == 0: Passes user_query directly to current_query.
- retrieval_iteration > 0: Generates optimized query based on feedback from evaluators.
"""

from __future__ import annotations

import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

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
    if dv.get("valid") is False or dv.get("category") == "INVALID_BYPASS":
        feedback = dv.get("feedback") or dv.get("reason")
        if feedback:
            parts.append(f"[No-Tool Evaluator]: {feedback}")

    rv = state.get("result_validation") or {}
    if rv.get("status") == "FAILED" or rv.get("should_retrieve_again"):
        feedback = rv.get("feedback")
        if feedback:
            parts.append(f"[Tool Evaluator]: {feedback}")

    return "\n".join(parts)


async def rewrite_query_node(state: AgentState) -> dict:
    """
    Rewrite current_query cho tool retrieval.

    - Lần đầu (retrieval_iteration == 0): pass-through user_query.
    - Retry (retrieval_iteration > 0): rewrite query dựa trên feedback từ evaluators.
    """
    user_query = (state.get("user_query") or "").strip()
    current_query = (state.get("current_query") or user_query).strip()
    query_history = list(state.get("query_history") or [])
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)
    feedback = _collect_validation_feedback(state)

    trace.banner(
        "NODE 1 · REWRITING (rewrite)",
        user_query=user_query,
        current_query=current_query,
        retrieval_iteration=f"{retrieval_iteration}/{max_retrieval}",
        has_feedback=bool(feedback),
    )

    # 1. First run pass-through
    if retrieval_iteration == 0 and not feedback:
        trace.step("Lần đầu (retrieval_iteration=0) — giữ nguyên user_query.")
        return {
            "current_query": user_query,
            "query_history": [user_query] if not query_history else query_history,
            "retrieval_iteration": 0,
            "progress": "Đang phân tích yêu cầu...",
        }

    # 2. Reached max discovery limit -> do not rewrite
    if retrieval_iteration >= max_retrieval:
        trace.warn("Đã đạt giới hạn MAX_RETRIEVAL_RETRIES — giữ current_query hiện tại.")
        return {
            "current_query": current_query,
            "progress": "Đang tìm kiếm công cụ phù hợp...",
        }

    # 3. Rewrite query on retry
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

    # Avoid A -> B -> A loop
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
        "final_status": None,
        "final_message": None,
    }
