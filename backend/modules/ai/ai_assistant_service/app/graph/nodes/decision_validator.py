"""
Node — DECISION_VALIDATOR.

Chỉ chạy khi Agent chọn FINAL_ANSWER / NO_TOOL.
Kết hợp deterministic rules + LLM semantic check (description.md §16–17).
"""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    build_decision_validator_prompt,
)
from backend.modules.ai.ai_assistant_service.app.utils.helpers import (
    extract_text_from_response,
    safe_json_loads,
    heuristic_needs_external_evidence,
)
from backend.modules.ai.ai_assistant_service.app.utils import trace
from backend.modules.ai.ai_assistant_service.tools.registry import summarize_tools

logger = logging.getLogger(__name__)


async def decision_validator_node(state: AgentState) -> dict:
    """
    Validate quyết định không dùng tool.

    VALID   → END với final_message
    INVALID → rewrite (nếu còn retrieval retry) hoặc END an toàn
    """
    user_query = state.get("user_query") or ""
    answer = state.get("final_message") or ""
    decision = state.get("decision") or {}
    active_tools = state.get("active_tools") or []
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)

    # Force-final path: luôn VALID để terminate an toàn
    iteration = int(state.get("iteration") or 0)
    max_iterations = int(state.get("max_iterations") or 6)
    force_end = iteration >= max_iterations

    trace.banner(
        "NODE · DECISION_VALIDATOR",
        action=decision.get("action"),
        force_end=force_end,
        retrieval_iteration=f"{retrieval_iteration}/{max_retrieval}",
        n_tools=len(active_tools),
    )

    if force_end:
        trace.warn("Force end — chấp nhận FINAL_ANSWER.")
        return {
            "decision_validation": {
                "status": "VALID",
                "feedback": "Đạt giới hạn vòng lặp — kết thúc an toàn.",
            },
            "final_status": "SUCCESS",
            "final_message": answer or "Xin lỗi, mình chưa xử lý được yêu cầu này.",
            "progress": "Đã tìm được thông tin phù hợp.",
        }

    needs_evidence, heuristic_hint = heuristic_needs_external_evidence(user_query)

    # Deterministic: cần evidence + còn tool khả dụng + còn lượt retrieve
    # → INVALID sớm (không cần LLM khi tín hiệu rõ)
    if needs_evidence and active_tools and retrieval_iteration < max_retrieval:
        feedback = (
            f"{heuristic_hint}. Có tool khả dụng nhưng Agent không gọi. "
            "Cần dùng tool thay vì đoán."
        )
        trace.warn("Heuristic INVALID: %s", feedback)
        return {
            "decision_validation": {
                "status": "INVALID",
                "feedback": feedback,
                "reason": "heuristic_needs_tool",
            },
            "final_status": None,
            # giữ final_message tạm để Agent/rewriter tham chiếu, nhưng chưa END
            "progress": "Kết quả chưa đủ, đang thử phương án khác...",
        }

    # LLM semantic validation
    prompt = build_decision_validator_prompt(
        user_query=user_query,
        agent_answer=answer,
        available_tools_summary=summarize_tools(active_tools),
        heuristic_hints=heuristic_hint,
    )

    status = "VALID"
    feedback = "OK"
    try:
        trace.step("Đang gọi LLM Decision Validator...")
        response = await state["llm"].ainvoke([HumanMessage(content=prompt)])
        raw = extract_text_from_response(response)
        parsed = safe_json_loads(raw) or {}
        status = str(parsed.get("status") or "VALID").upper()
        if status not in {"VALID", "INVALID"}:
            status = "VALID"
        feedback = str(parsed.get("feedback") or "").strip() or feedback
    except Exception:
        logger.exception("[Node:DecisionValidator] LLM lỗi — fallback VALID.")
        trace.warn("Decision Validator lỗi — fallback VALID.")
        status = "VALID"
        feedback = "Validator lỗi — tạm chấp nhận câu trả lời."

    # Hết lượt discovery → không INVALID nữa
    if status == "INVALID" and retrieval_iteration >= max_retrieval:
        trace.warn("INVALID nhưng hết retrieval retries — END với câu trả lời hiện có.")
        status = "VALID"
        feedback = "Hết lượt retrieve — chấp nhận câu trả lời hiện tại. " + feedback

    if status == "VALID":
        trace.step("VALID — END. feedback=%s", feedback)
        return {
            "decision_validation": {"status": "VALID", "feedback": feedback},
            "final_status": "SUCCESS",
            "final_message": answer or "Xin lỗi, mình chưa có câu trả lời phù hợp.",
            "progress": "Đã tìm được thông tin phù hợp.",
        }

    trace.warn("INVALID — chuyển Query Rewriter. feedback=%s", feedback)
    return {
        "decision_validation": {
            "status": "INVALID",
            "feedback": feedback,
            "reason": "llm_invalid",
        },
        "final_status": None,
        "progress": "Kết quả chưa đủ, đang thử phương án khác...",
    }
