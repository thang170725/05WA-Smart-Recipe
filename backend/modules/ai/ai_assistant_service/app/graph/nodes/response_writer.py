"""
Node 6: RESPONSE_WRITER (agent_return_result).

Nhiệm vụ:
  - Nhận toàn bộ context đã được xác thực (state, tool_results, decision_validation).
  - Sử dụng LLM chuyên viết câu trả lời để tạo phản hồi tự nhiên, chuẩn mực bằng tiếng Việt.
  - Chốt final_message và final_status ("SUCCESS").
"""

from __future__ import annotations

import json
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from langchain_core.messages import AIMessage, HumanMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    build_response_writer_prompt,
)
from backend.modules.ai.ai_assistant_service.app.utils.helpers import extract_text_from_response
from backend.modules.ai.ai_assistant_service.app.utils import trace


async def response_writer_node(state: AgentState) -> dict:
    """
    Tạo câu trả lời cuối cùng cho người dùng.
    """
    # 1. Trường hợp đặc biệt: WAIT_CONFIRM (Write tool đang chờ người dùng confirm)
    if state.get("final_status") == "WAIT_CONFIRM":
        trace.banner("NODE 6 · GENERATIVE RESULT (agent_return_result)", status="WAIT_CONFIRM")
        return {
            "progress": "Chờ xác nhận từ người dùng...",
        }

    # 2. Nếu đã có lỗi từ node trước và có final_message
    if state.get("final_status") == "ERROR" and state.get("final_message"):
        trace.banner("NODE 6 · GENERATIVE RESULT (agent_return_result)", status="ERROR")
        return {
            "progress": "Hoàn tất với thông báo lỗi.",
        }

    user_query = state.get("user_query") or ""
    tool_results = state.get("tool_results") or []
    dv = state.get("decision_validation") or {}
    rv = state.get("result_validation") or {}

    category = dv.get("category") or ("DATA_COMPLETE" if tool_results else "ASKANDANSWER")
    feedback = dv.get("feedback") or rv.get("feedback") or ""

    trace.banner(
        "NODE 6 · GENERATIVE RESULT (agent_return_result)",
        category=category,
        n_tool_results=len(tool_results),
    )

    # Tóm tắt tool results
    if tool_results:
        results_lines = []
        for r in tool_results:
            name = r.get("name", "tool")
            res = json.dumps(r.get("result"), ensure_ascii=False, default=str)
            if len(res) > 500:
                res = res[:500] + "..."
            results_lines.append(f"- {name}: {res}")
        tool_results_summary = "\n".join(results_lines)
    else:
        tool_results_summary = "(không có dữ liệu công cụ)"

    # Tóm tắt messages
    messages = state.get("messages") or []
    msg_lines = []
    for m in messages[-6:]:
        m_type = getattr(m, "type", "msg")
        m_content = getattr(m, "content", "")
        if isinstance(m_content, str):
            preview = m_content[:300] if len(m_content) > 300 else m_content
            msg_lines.append(f"{m_type}: {preview}")
    messages_summary = "\n".join(msg_lines) if msg_lines else "(không có)"

    prompt = build_response_writer_prompt(
        user_query=user_query,
        category=category,
        feedback=feedback,
        tool_results_summary=tool_results_summary,
        messages_summary=messages_summary,
    )

    llm = state["llm"]
    final_text = ""

    try:
        trace.step("Đang gọi LLM viết câu trả lời cuối...")
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        final_text = extract_text_from_response(response)
    except Exception as exc:
        logger.exception("[Node:ResponseWriter] LLM lỗi: %s", exc)
        trace.error("Response Writer lỗi: %s", exc)
        final_text = "Xin lỗi, hiện tại tôi chưa thể hoàn thiện câu trả lời. Bạn vui lòng thử lại nhé!"

    if not final_text.strip():
        final_text = "Xin lỗi, tôi chưa tìm thấy thông tin phù hợp cho yêu cầu này."

    trace.step("Response Writer hoàn thành (%d ký tự)", len(final_text))

    return {
        "messages": [AIMessage(content=final_text)],
        "final_status": "SUCCESS",
        "final_message": final_text,
        "progress": "Đã hoàn thành câu trả lời.",
    }
