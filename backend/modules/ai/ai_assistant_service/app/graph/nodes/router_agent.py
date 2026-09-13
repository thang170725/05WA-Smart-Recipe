"""
Node 3: ROUTER AGENT (agent_choose_branch).

Nhiệm vụ duy nhất:
Phân nhánh quyết định:
  - TOOL: Yêu cầu cần gọi tool / hàm ngoài / DB.
  - NO_TOOL: Yêu cầu là kiến thức chung, trò chuyện hoặc ngoài phạm vi.
"""

from __future__ import annotations

import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from langchain_core.messages import SystemMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    ROUTER_AGENT_SYSTEM_PROMPT,
    FORCE_NO_TOOL_PROMPT,
    build_result_feedback_message,
)
from backend.modules.ai.ai_assistant_service.app.config.settings import format_llm_error
from backend.modules.ai.ai_assistant_service.app.utils import trace


async def router_agent_node(state: AgentState) -> dict:
    """
    Router Agent: phân loại intent thành TOOL hoặc NO_TOOL.
    Output state:
        decision = {"action": "TOOL" | "NO_TOOL", "tool_calls": [...]}
    """
    llm = state["llm"]
    tools = state.get("active_tools") or []
    messages = list(state.get("messages") or [])
    iteration = int(state.get("iteration") or 0) + 1
    max_iterations = int(state.get("max_iterations") or 6)
    execution_iteration = int(state.get("execution_iteration") or 0)
    max_execution = int(state.get("max_execution_steps") or 4)

    force_no_tool = (iteration >= max_iterations or execution_iteration >= max_execution)

    trace.banner(
        "NODE 3 · ROUTER AGENT (agent_choose_branch)",
        iteration=f"{iteration}/{max_iterations}",
        execution=f"{execution_iteration}/{max_execution}",
        force_no_tool=force_no_tool,
        tools_bound=[t.name for t in tools],
        user_query=state.get("user_query"),
    )

    if force_no_tool:
        trace.warn("Đã đạt giới hạn vòng lặp — ép nhánh NO_TOOL.")
        return {
            "iteration": iteration,
            "decision": {
                "action": "NO_TOOL",
                "tool_calls": [],
            },
            "progress": "Đang tổng hợp kết quả...",
        }

    # Bind tools vào LLM nếu có tools khả dụng
    if tools:
        runnable = llm.bind_tools(tools)
        trace.step("Đã bind %d tools vào Router LLM", len(tools))
    else:
        runnable = llm
        trace.step("Không có tools khả dụng — Router LLM chạy thuần text")

    system_parts = [ROUTER_AGENT_SYSTEM_PROMPT]
    feedback_msgs: list[SystemMessage] = []

    # Nhận feedback từ result_evaluator nếu đây là vòng lặp multi-step
    rv = state.get("result_validation")
    if rv and rv.get("feedback"):
        feedback_msgs.append(SystemMessage(content=build_result_feedback_message(rv)))

    used = state.get("used_tools") or []
    if used:
        feedback_msgs.append(
            SystemMessage(
                content=f"[LỊCH SỬ TOOL ĐÃ GỌI]: {', '.join(used)}. Hãy cân nhắc gọi tool tiếp theo nếu cần hoặc kết thúc."
            )
        )

    invoke_messages = (
        [SystemMessage(content="\n\n".join(system_parts))]
        + feedback_msgs
        + messages
    )

    trace.step("Đang gọi LLM phân nhánh...")
    try:
        ai_msg = await runnable.ainvoke(invoke_messages)
    except Exception as exc:
        logger.exception("[Node:RouterAgent] LLM lỗi: %s", exc)
        err_text = format_llm_error(exc)
        trace.error("Router Agent LLM fail: %s", err_text)
        return {
            "iteration": iteration,
            "decision": {
                "action": "NO_TOOL",
                "tool_calls": [],
            },
            "final_status": "ERROR",
            "final_message": err_text,
            "progress": "Gặp sự cố khi gọi mô hình...",
        }

    tool_calls = getattr(ai_msg, "tool_calls", None) or []
    if tool_calls:
        trace.step("Router Agent quyết định: TOOL (%d calls)", len(tool_calls))
        for tc in tool_calls:
            trace.step("  -> Tool call: %s args=%s", tc.get("name"), tc.get("args"))

        return {
            "messages": [ai_msg],
            "iteration": iteration,
            "decision": {
                "action": "TOOL",
                "tool_calls": [
                    {"name": tc.get("name"), "args": tc.get("args") or {}, "id": tc.get("id")}
                    for tc in tool_calls
                ],
            },
            "progress": "Đang thực hiện truy vấn công cụ...",
        }

    trace.step("Router Agent quyết định: NO_TOOL")
    return {
        "messages": [ai_msg],
        "iteration": iteration,
        "decision": {
            "action": "NO_TOOL",
            "tool_calls": [],
        },
        "progress": "Đang kiểm tra yêu cầu...",
    }
