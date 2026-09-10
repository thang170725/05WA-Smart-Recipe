"""
Node — AGENT (Reasoning).

Quyết định structured:
  CALL_TOOL       → có tool_calls (bind_tools)
  FINAL_ANSWER    → trả lời text, không tool
  NEED_RETRIEVAL  → JSON {"action":"NEED_RETRIEVAL",...} khi tool list không phù hợp

Nhận feedback từ result_validation / decision_validation để self-correct.
"""

from __future__ import annotations

# =================================
# ======== nơi setup logging ======
# =================================
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

# =====================================
# ======== nơi import thư viện ========
# =====================================
from langchain_core.messages import SystemMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    AGENT_SYSTEM_PROMPT,
    FORCE_FINAL_ANSWER_PROMPT,
    build_result_feedback_message,
    build_decision_invalid_feedback,
)
from backend.modules.ai.ai_assistant_service.app.utils.helpers import (
    extract_text_from_response,
    parse_need_retrieval,
)
from backend.modules.ai.ai_assistant_service.app.utils import trace

#
#
#
def _build_feedback_system_messages(state: AgentState) -> list[SystemMessage]:
    """Đưa validation feedback vào context Agent (không expose CoT dài)."""
    msgs: list[SystemMessage] = []

    rv = state.get("result_validation")
    if rv and rv.get("feedback"):
        msgs.append(SystemMessage(content=build_result_feedback_message(rv)))

    # Sau discovery lại: nhắc Agent vì sao lần trước INVALID
    dv = state.get("decision_validation")
    if dv and dv.get("status") == "INVALID" and dv.get("feedback"):
        # Chỉ nhắc nếu vừa retrieve lại (có retrieval_iteration > 0)
        if int(state.get("retrieval_iteration") or 0) > 0:
            msgs.append(
                SystemMessage(content=build_decision_invalid_feedback(dv["feedback"]))
            )

    used = state.get("used_tools") or []
    if used:
        msgs.append(
            SystemMessage(
                content=(
                    "[TOOL HISTORY] Các tool đã gọi: "
                    + ", ".join(used)
                    + ". Tránh lặp vô ích cùng args nếu trước đó INVALID."
                )
            )
        )
    return msgs


async def agent_node(state: AgentState) -> dict:
    """Gọi LLM (bind_tools) để suy luận bước tiếp theo."""
    # 1. tạo các biến lấy dữ liệu
    llm = state["llm"]
    tools = state.get("active_tools") or []
    messages = list(state.get("messages") or [])
    iteration = int(state.get("iteration") or 0) + 1
    max_iterations = int(state.get("max_iterations") or 6)
    execution_iteration = int(state.get("execution_iteration") or 0)
    max_execution = int(state.get("max_execution_steps") or 4)
    force_final = (iteration >= max_iterations or execution_iteration >= max_execution)

    trace.banner(
        "NODE 3 · AGENT (Reasoning)",
        iteration=f"{iteration}/{max_iterations}",
        execution=f"{execution_iteration}/{max_execution}",
        force_final=force_final,
        tools_bound=[t.name for t in tools],
        user_query=state.get("user_query"),
    )

    if tools and not force_final:
        runnable = llm.bind_tools(tools)
        trace.step("Đã bind %d tools vào LLM", len(tools))
    else:
        runnable = llm
        if force_final:
            trace.warn("Hết vòng lặp / execution limit — ép FINAL_ANSWER.")

    system_parts = [AGENT_SYSTEM_PROMPT]
    if force_final:
        system_parts.append(FORCE_FINAL_ANSWER_PROMPT)

    invoke_messages = (
        [SystemMessage(content="\n\n".join(system_parts))]
        + _build_feedback_system_messages(state)
        + messages
    )

    trace.step("Đang gọi LLM suy luận...")
    try:
        ai_msg = await runnable.ainvoke(invoke_messages)
    except Exception as exc:
        # Ollama crash / OOM / timeout — kết thúc an toàn thay vì làm sập cả graph
        logger.exception("[Node:Agent] LLM lỗi: %s", exc)
        from backend.modules.ai.ai_assistant_service.app.config.settings import (
            format_llm_error,
        )

        err_text = format_llm_error(exc)
        trace.error("Agent LLM fail: %s", err_text)
        return {
            "iteration": iteration,
            "decision": {
                "action": "FINAL_ANSWER",
                "answer": err_text,
            },
            "final_status": "ERROR",
            "final_message": err_text,
            "progress": "Gặp lỗi khi gọi model...",
        }

    logger.debug("AI suy luận:\n%s", ai_msg)

    tool_calls = getattr(ai_msg, "tool_calls", None) or []
    if tool_calls and not force_final:
        for tc in tool_calls:
            trace.step(
                "CALL_TOOL: name=%s args=%s",
                tc.get("name"),
                tc.get("args"),
            )
        return {
            "messages": [ai_msg],
            "iteration": iteration,
            "decision": {
                "action": "CALL_TOOL",
                "tool_calls": [
                    {"name": tc.get("name"), "args": tc.get("args") or {}}
                    for tc in tool_calls
                ],
            },
            "final_status": None,
            "final_message": None,
            "progress": "Đang thực hiện truy vấn...",
        }

    final_text = extract_text_from_response(ai_msg)
    logger.debug(f"FINAL TEXT:\n{final_text}")

    # NEED_RETRIEVAL — discovery lại
    if not force_final:
        need = parse_need_retrieval(final_text)
        logger.debug(f"NEED:\n{need}")
        if need:
            trace.step("NEED_RETRIEVAL: %s", need.get("reason"))
            return {
                "messages": [ai_msg],
                "iteration": iteration,
                "decision": need,
                "final_status": None,
                "final_message": None,
                "progress": "Kết quả chưa đủ, đang thử phương án khác...",
            }

    return {
        "messages": [ai_msg],
        "iteration": iteration,
        "decision": {
            "action": "FINAL_ANSWER",
            "answer": final_text,
        },
        # Chưa END — Decision Validator sẽ chốt VALID/INVALID
        "final_status": None,
        "final_message": final_text or "Xin lỗi, mình chưa có câu trả lời phù hợp.",
        "progress": "Đang kiểm tra kết quả...",
    }
