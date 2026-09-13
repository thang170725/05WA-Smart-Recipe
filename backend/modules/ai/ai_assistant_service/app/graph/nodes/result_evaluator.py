"""
Node 5.1: RESULT_EVALUATOR (eval_tool).

Chạy SAU EXECUTE_TOOL. Đánh giá kết quả thực thi công cụ:
  - DATA_COMPLETE: Dữ liệu đã đủ để tổng hợp câu trả lời -> agent_return_result
  - NEED_MORE_TOOLS: Cần gọi thêm công cụ khác -> agent_choose_branch
  - FAILED: Lỗi thực thi / sai tool / thiếu dữ liệu nghiêm trọng -> rewrite
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

_VALID_STATUSES = {"DATA_COMPLETE", "NEED_MORE_TOOLS", "FAILED"}


def _heuristic_from_results(tool_results: list[dict]) -> dict | None:
    """Heuristic nhanh từ kết quả execute gần nhất."""
    if not tool_results:
        return {
            "status": "FAILED",
            "category": "EXECUTION_ERROR",
            "feedback": "Không có tool result nào sau khi execute.",
            "should_retrieve_again": True,
        }

    latest_iter = tool_results[-1].get("execution_iteration")
    latest = [r for r in tool_results if r.get("execution_iteration") == latest_iter]

    hard_errors = []
    for r in latest:
        result = r.get("result")
        if isinstance(result, dict):
            status = str(result.get("status") or "").lower()
            msg = str(result.get("message") or "").lower()
            if status == "error":
                hard_errors.append(result.get("message"))

    if hard_errors:
        return {
            "status": "FAILED",
            "category": "EXECUTION_ERROR",
            "feedback": str(hard_errors[0] or "Tool trả lỗi."),
            "should_retrieve_again": True,
        }
    return None


async def result_evaluator_node(state: AgentState) -> dict:
    """
    Đánh giá kết quả từ tool:
    Trạng thái: DATA_COMPLETE | NEED_MORE_TOOLS | FAILED
    """
    # Nếu đang chờ user confirm thao tác ghi -> DATA_COMPLETE để tới agent_return_result giữ nguyên trạng thái
    if state.get("final_status") == "WAIT_CONFIRM":
        trace.banner("NODE 5.1 · RESULT EVALUATOR (eval_tool)", status="WAIT_CONFIRM")
        validation = {
            "status": "DATA_COMPLETE",
            "category": "WAIT_CONFIRM",
            "feedback": "Thao tác ghi đang chờ người dùng xác nhận.",
            "should_retrieve_again": False,
        }
        return {
            "result_validation": validation,
            "progress": "Chờ xác nhận từ người dùng...",
        }

    user_query = state.get("user_query") or ""
    tool_results = list(state.get("tool_results") or [])
    decision = state.get("decision") or {}

    trace.banner(
        "NODE 5.1 · RESULT EVALUATOR (eval_tool)",
        n_results=len(tool_results),
        last_action=decision.get("action"),
    )

    # 1. Kiểm tra Heuristic trước
    heuristic = _heuristic_from_results(tool_results)
    if heuristic and heuristic["status"] == "FAILED":
        trace.step("Heuristic FAILED: %s", heuristic["feedback"])
        return {
            "result_validation": heuristic,
            "messages": [SystemMessage(content=build_result_feedback_message(heuristic))],
            "progress": "Kết quả chưa đủ, đang chuẩn bị thử lại...",
        }

    # 2. Tóm tắt kết quả tool cho LLM
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
        "status": "DATA_COMPLETE",
        "category": "OK",
        "feedback": "Dữ liệu tool trả về đầy đủ và hợp lệ.",
        "should_retrieve_again": False,
    }

    try:
        trace.step("Đang gọi LLM Result Evaluator...")
        response = await state["llm"].ainvoke([HumanMessage(content=prompt)])
        raw = extract_text_from_response(response)
        parsed = safe_json_loads(raw) or {}
        raw_status = str(parsed.get("status") or "DATA_COMPLETE").upper()

        # Map legacy or synonym statuses
        if raw_status in {"SUCCESS", "COMPLETE", "DATA_COMPLETE"}:
            status = "DATA_COMPLETE"
        elif raw_status in {"INSUFFICIENT", "NEED_MORE_TOOLS", "MORE_TOOLS"}:
            status = "NEED_MORE_TOOLS"
        else:
            status = "FAILED"

        validation = {
            "status": status,
            "category": str(parsed.get("category") or "OK"),
            "feedback": str(parsed.get("feedback") or "").strip() or validation["feedback"],
            "should_retrieve_again": bool(parsed.get("should_retrieve_again", False)),
        }
        if validation["category"].upper() == "WRONG_TOOL":
            validation["should_retrieve_again"] = True
            validation["status"] = "FAILED"

    except Exception:
        logger.exception("[Node:ResultEvaluator] LLM lỗi — fallback DATA_COMPLETE.")
        trace.warn("Result Evaluator lỗi — fallback DATA_COMPLETE.")

    trace.step(
        "Result Eval: status=%s category=%s retrieve_again=%s | %s",
        validation["status"],
        validation["category"],
        validation["should_retrieve_again"],
        validation["feedback"],
    )

    return {
        "result_validation": validation,
        "messages": [SystemMessage(content=build_result_feedback_message(validation))],
        "progress": (
            "Đang chuẩn bị câu trả lời..."
            if validation["status"] == "DATA_COMPLETE"
            else "Đang xử lý các bước tiếp theo..."
        ),
    }
