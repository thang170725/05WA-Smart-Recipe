"""
Node — RESULT_EVALUATOR.

Chạy SAU EXECUTE. Đánh giá tool result (không thay Agent quyết định bước tiếp).
Trả structured:
  status: SUCCESS | INSUFFICIENT | INVALID | RETRY
  category, feedback, should_retrieve_again
"""

from __future__ import annotations

import json
import logging

from langchain_core.messages import HumanMessage, SystemMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    build_result_evaluator_prompt,
    build_result_feedback_message,
)
from backend.modules.ai.ai_assistant_service.app.utils.helpers import (
    extract_text_from_response,
    safe_json_loads,
)
from backend.modules.ai.ai_assistant_service.app.utils import trace

logger = logging.getLogger(__name__)

_VALID_STATUSES = {"SUCCESS", "INSUFFICIENT", "INVALID", "RETRY"}


def _heuristic_from_results(tool_results: list[dict]) -> dict | None:
    """
    Heuristic nhanh từ kết quả execute gần nhất.
    Trả None nếu chưa đủ để kết luận → nhờ LLM.
    """
    if not tool_results:
        return {
            "status": "INVALID",
            "category": "EXECUTION_ERROR",
            "feedback": "Không có tool result nào sau khi execute.",
            "should_retrieve_again": False,
        }

    # Chỉ xét batch mới nhất (cùng execution_iteration)
    latest_iter = tool_results[-1].get("execution_iteration")
    latest = [r for r in tool_results if r.get("execution_iteration") == latest_iter]

    hard_errors = []
    for r in latest:
        result = r.get("result")
        if isinstance(result, dict):
            status = str(result.get("status") or "").lower()
            msg = str(result.get("message") or "").lower()
            if status == "error":
                if any(x in msg for x in ("timeout", "timed out", "connection", "network")):
                    hard_errors.append(("RETRY", result.get("message")))
                else:
                    hard_errors.append(("INVALID", result.get("message")))

    if hard_errors:
        kind, msg = hard_errors[0]
        return {
            "status": kind,
            "category": "EXECUTION_ERROR",
            "feedback": str(msg or "Tool trả lỗi."),
            "should_retrieve_again": False,
        }
    return None


async def result_evaluator_node(state: AgentState) -> dict:
    user_query = state.get("user_query") or ""
    tool_results = list(state.get("tool_results") or [])
    decision = state.get("decision") or {}

    trace.banner(
        "NODE · RESULT_EVALUATOR",
        n_results=len(tool_results),
        last_action=decision.get("action"),
    )

    # Heuristic trước
    heuristic = _heuristic_from_results(tool_results)
    if heuristic and heuristic["status"] in {"RETRY", "INVALID"}:
        # Với INVALID do execution error — hỏi LLM nếu muốn phân biệt WRONG_TOOL
        # nhưng execution error rõ thì dùng heuristic luôn
        if heuristic["status"] == "RETRY" or heuristic["category"] == "EXECUTION_ERROR":
            trace.step("Heuristic: %s — %s", heuristic["status"], heuristic["feedback"])
            validation = heuristic
            return {
                "result_validation": validation,
                "messages": [SystemMessage(content=build_result_feedback_message(validation))],
                "progress": "Đang kiểm tra kết quả...",
            }

    # Tóm tắt batch mới nhất cho LLM
    latest_iter = tool_results[-1].get("execution_iteration") if tool_results else None
    latest = (
        [r for r in tool_results if r.get("execution_iteration") == latest_iter]
        if latest_iter is not None
        else tool_results[-3:]
    )

    calls_summary = "\n".join(
        f"- {r.get('name')} args={json.dumps(r.get('args') or {}, ensure_ascii=False)}"
        for r in latest
    ) or "(không có)"
    results_summary = "\n".join(
        f"- {r.get('name')}: {json.dumps(r.get('result'), ensure_ascii=False, default=str)[:500]}"
        for r in latest
    ) or "(không có)"

    prompt = build_result_evaluator_prompt(
        user_query=user_query,
        tool_calls_summary=calls_summary,
        tool_results_summary=results_summary,
    )

    validation = {
        "status": "SUCCESS",
        "category": "OK",
        "feedback": "Tool result hợp lệ.",
        "should_retrieve_again": False,
    }

    try:
        trace.step("Đang gọi LLM Result Evaluator...")
        response = await state["llm"].ainvoke([HumanMessage(content=prompt)])
        raw = extract_text_from_response(response)
        parsed = safe_json_loads(raw) or {}
        status = str(parsed.get("status") or "SUCCESS").upper()
        if status not in _VALID_STATUSES:
            status = "SUCCESS"
        validation = {
            "status": status,
            "category": str(parsed.get("category") or "OK"),
            "feedback": str(parsed.get("feedback") or "").strip() or validation["feedback"],
            "should_retrieve_again": bool(parsed.get("should_retrieve_again", False)),
        }
        # WRONG_TOOL → bắt buộc should_retrieve_again
        if validation["category"].upper() == "WRONG_TOOL":
            validation["should_retrieve_again"] = True
    except Exception:
        logger.exception("[Node:ResultEvaluator] LLM lỗi — fallback SUCCESS.")
        trace.warn("Result Evaluator lỗi — fallback SUCCESS.")

    trace.step(
        "Result: status=%s category=%s retrieve_again=%s | %s",
        validation["status"],
        validation["category"],
        validation["should_retrieve_again"],
        validation["feedback"],
    )

    return {
        "result_validation": validation,
        "messages": [SystemMessage(content=build_result_feedback_message(validation))],
        "progress": (
            "Kết quả chưa đủ, đang thử phương án khác..."
            if validation["status"] != "SUCCESS"
            else "Đang xác định phương án xử lý..."
        ),
    }
