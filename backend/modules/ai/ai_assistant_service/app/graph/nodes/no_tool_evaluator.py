"""
Node 5.2: NO-TOOL EVALUATOR (eval_no_tool).

Chỉ chạy khi Router Agent chọn NO_TOOL.
Nhiệm vụ:
  - Xác thực việc không gọi tool có hợp lý không.
  - Phân loại ý định:
      * ASKANDANSWER: Hỏi - đáp thông thường / kiến thức dinh dưỡng / chit-chat.
      * OUTSIDE: Ngoài phạm vi (công nghệ, tài chính, chính trị,...).
      * UNKNOWN: Không rõ ý định, cần hỏi lại.
      * INVALID_BYPASS: Cần gọi tool nhưng lại bị bỏ qua (không hợp lệ).
  - Trả state.decision_validation = {"valid": bool, "category": str, "reason": str, "feedback": str}.
"""

from __future__ import annotations

import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from langchain_core.messages import HumanMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    build_no_tool_evaluator_prompt,
)
from backend.modules.ai.ai_assistant_service.app.utils.helpers import (
    extract_text_from_response,
    safe_json_loads,
    heuristic_needs_external_evidence,
)
from backend.modules.ai.ai_assistant_service.app.utils import trace
from backend.modules.ai.ai_assistant_service.tools.registry import summarize_tools

_VALID_CATEGORIES = {"ASKANDANSWER", "OUTSIDE", "UNKNOWN", "INVALID_BYPASS"}


async def no_tool_evaluator_node(state: AgentState) -> dict:
    """
    Validate xem việc bỏ qua tool có hợp lệ hay không.
    Valid (YES) -> agent_return_result
    Invalid (NO) -> rewrite
    """
    user_query = state.get("user_query") or ""
    active_tools = state.get("active_tools") or []
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)
    iteration = int(state.get("iteration") or 0)
    max_iterations = int(state.get("max_iterations") or 6)

    force_valid = (iteration >= max_iterations or retrieval_iteration >= max_retrieval)

    trace.banner(
        "NODE 5.2 · NO-TOOL EVALUATOR (eval_no_tool)",
        force_valid=force_valid,
        retrieval_iteration=f"{retrieval_iteration}/{max_retrieval}",
        n_tools=len(active_tools),
    )

    if force_valid:
        trace.warn("Đạt giới hạn vòng lặp — kết thúc an toàn, coi như VALID.")
        return {
            "decision_validation": {
                "valid": True,
                "category": "ASKANDANSWER",
                "reason": "Hết lượt retry / discovery",
                "feedback": "Đạt giới hạn vòng lặp — tạo câu trả lời với thông tin hiện có.",
            },
            "progress": "Đang tổng hợp câu trả lời...",
        }

    needs_evidence, heuristic_hint = heuristic_needs_external_evidence(user_query)

    prompt = build_no_tool_evaluator_prompt(
        user_query=user_query,
        available_tools_summary=summarize_tools(active_tools),
        heuristic_hints=heuristic_hint,
    )

    category = "ASKANDANSWER"
    reason = "General query"
    feedback = "OK"

    try:
        trace.step("Đang gọi LLM No-Tool Evaluator...")
        response = await state["llm"].ainvoke([HumanMessage(content=prompt)])
        raw = extract_text_from_response(response)
        parsed = safe_json_loads(raw) or {}

        cat_candidate = str(parsed.get("category") or "").upper()
        if cat_candidate in _VALID_CATEGORIES:
            category = cat_candidate
        else:
            # Suy luận từ field valid nếu có
            if parsed.get("valid") is False:
                category = "INVALID_BYPASS"
            else:
                category = "ASKANDANSWER"

        reason = str(parsed.get("reason") or "").strip() or reason
        feedback = str(parsed.get("feedback") or "").strip() or feedback
    except Exception:
        logger.exception("[Node:NoToolEvaluator] LLM lỗi — fallback ASKANDANSWER.")
        trace.warn("No-Tool Evaluator lỗi — fallback ASKANDANSWER.")
        category = "ASKANDANSWER"
        feedback = "Evaluator lỗi — tạm chấp nhận câu trả lời."

    valid = (category != "INVALID_BYPASS")

    # Nếu hết lượt retry nhưng lại INVALID -> ép thành VALID để tránh infinite loop
    if not valid and retrieval_iteration >= max_retrieval:
        trace.warn("INVALID_BYPASS nhưng đã hết lượt retry — ép VALID.")
        valid = True
        category = "ASKANDANSWER"
        feedback = "Hết lượt retrieve — trả lời bằng kiến thức sẵn có."

    trace.step(
        "No-Tool Eval: valid=%s category=%s | reason=%s",
        valid,
        category,
        reason,
    )

    return {
        "decision_validation": {
            "valid": valid,
            "category": category,
            "reason": reason,
            "feedback": feedback,
        },
        "progress": (
            "Đang tổng hợp câu trả lời..."
            if valid
            else "Cần công cụ phù hợp, đang tìm kiếm lại..."
        ),
    }
