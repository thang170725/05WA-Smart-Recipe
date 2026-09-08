"""
Node — EXECUTE (Tool Execution).

Agent đã CALL_TOOL → execute ngay (không qua pre-execution evaluator).
Sau đó Result Evaluator sẽ đánh giá kết quả.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from langchain_core.messages import ToolMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils.helpers import serialize_tool_result
from backend.modules.ai.ai_assistant_service.app.utils import trace
from backend.modules.ai.ai_assistant_service.tools.registry import (
    TOOL_EXECUTORS,
    is_write_tool,
)

logger = logging.getLogger(__name__)

PENDING_ACTIONS: dict[str, dict[str, Any]] = {}


async def execute_tools_node(state: AgentState) -> dict:
    last_msg = state["messages"][-1]
    tool_calls = getattr(last_msg, "tool_calls", None) or []

    execution_iteration = int(state.get("execution_iteration") or 0) + 1
    history_calls = list(state.get("tool_calls") or [])
    history_results = list(state.get("tool_results") or [])
    used_tools = list(state.get("used_tools") or [])

    trace.banner(
        "NODE · EXECUTE",
        n_calls=len(tool_calls),
        execution_iteration=execution_iteration,
    )

    if not tool_calls:
        trace.warn("Không có tool_calls để chạy.")
        return {
            "final_status": "ERROR",
            "final_message": "Không có công cụ nào để thực thi.",
            "execution_iteration": execution_iteration,
        }

    db = state["db"]
    user = state["current_user"]
    user_id = getattr(user, "id", None)
    llm = state["llm"]

    tool_messages: list[ToolMessage] = []

    for tc in tool_calls:
        name = tc.get("name")
        args = tc.get("args") or {}
        call_id = tc.get("id") or str(uuid.uuid4())

        history_calls.append(
            {
                "name": name,
                "args": args,
                "execution_iteration": execution_iteration,
            }
        )
        if name and name not in used_tools:
            used_tools.append(name)

        # ---- WRITE: treo xác nhận ----
        if is_write_tool(name):
            action_id = str(uuid.uuid4())
            PENDING_ACTIONS[action_id] = {
                "user_id": user_id,
                "intent": name,
                "new_content": args,
            }
            trace.step(
                "WRITE tool=%s → WAIT_CONFIRM action_id=%s args=%s",
                name,
                action_id,
                args,
            )

            confirm_prompt = (
                f"Người dùng muốn thực hiện thao tác '{name}' với dữ liệu {args}. "
                "Hãy viết MỘT câu tiếng Việt ngắn gọn, thân thiện để hỏi họ xác nhận "
                "trước khi lưu thay đổi. Không giải thích dài."
            )
            try:
                confirm_msg = await llm.ainvoke(confirm_prompt)
                confirm_text = getattr(confirm_msg, "content", None) or str(confirm_msg)
                if isinstance(confirm_text, list):
                    confirm_text = " ".join(
                        p.get("text", str(p)) if isinstance(p, dict) else str(p)
                        for p in confirm_text
                    )
            except Exception:
                confirm_text = (
                    f"Bạn có chắc muốn thực hiện '{name}' với {args}? "
                    "Hãy xác nhận để mình lưu thay đổi."
                )

            return {
                "final_status": "WAIT_CONFIRM",
                "action_id": action_id,
                "final_message": str(confirm_text).strip(),
                "tool_calls": history_calls,
                "used_tools": used_tools,
                "execution_iteration": execution_iteration,
                "progress": "Đang thực hiện truy vấn...",
            }

        # ---- READ ----
        trace.step("READ tool=%s args=%s", name, args)
        executor = TOOL_EXECUTORS.get(name)
        if executor is None:
            result: Any = {
                "status": "error",
                "message": f"Không tìm thấy executor cho '{name}'.",
            }
            trace.warn("%s", result["message"])
        else:
            try:
                result = await executor(db=db, user_id=user_id, **args)
                preview = serialize_tool_result(result)
                if len(preview) > 200:
                    preview = preview[:200] + "..."
                trace.step("Kết quả tool: %s", preview)
            except Exception as exc:
                logger.exception("[Node:Execute] Tool '%s' lỗi.", name)
                result = {"status": "error", "message": f"Lỗi khi chạy {name}: {exc}"}
                trace.error("%s", result["message"])

        history_results.append(
            {
                "name": name,
                "args": args,
                "result": result,
                "execution_iteration": execution_iteration,
            }
        )
        tool_messages.append(
            ToolMessage(
                content=serialize_tool_result(result),
                tool_call_id=call_id,
                name=name,
            )
        )

    trace.step("Trả %d ToolMessage → Result Evaluator", len(tool_messages))
    return {
        "messages": tool_messages,
        "tool_calls": history_calls,
        "tool_results": history_results,
        "used_tools": used_tools,
        "execution_iteration": execution_iteration,
        "progress": "Đang kiểm tra kết quả...",
    }


async def run_pending_write_action(db, action_id: str) -> dict:
    """API confirm: thực thi write tool đã treo."""
    pending = PENDING_ACTIONS.get(action_id)
    if not pending:
        trace.warn("Confirm thất bại: action_id=%s không tồn tại", action_id)
        return {"status": "error", "message": "Yêu cầu không tồn tại hoặc đã hết hạn."}

    tool_name = pending["intent"]
    tool_args = pending["new_content"] or {}
    user_id = pending["user_id"]

    trace.banner("CONFIRM WRITE", action_id=action_id, tool=tool_name, args=tool_args)

    executor = TOOL_EXECUTORS.get(tool_name)
    if executor is None:
        PENDING_ACTIONS.pop(action_id, None)
        return {"status": "error", "message": f"Tool '{tool_name}' không còn hỗ trợ."}

    try:
        result = await executor(db=db, user_id=user_id, **tool_args)
    except Exception as exc:
        logger.exception("[Confirm] Lỗi thực thi write tool.")
        return {"status": "error", "message": f"Thực thi thất bại: {exc}"}
    finally:
        PENDING_ACTIONS.pop(action_id, None)

    if isinstance(result, dict) and result.get("status") == "success":
        trace.step("Confirm SUCCESS: %s", result.get("message"))
        return {
            "status": "success",
            "message": result.get("message") or "Đã cập nhật thành công.",
        }

    msg = (
        (result or {}).get("message", "Cập nhật thất bại.")
        if isinstance(result, dict)
        else "Cập nhật thất bại."
    )
    trace.warn("Confirm FAIL: %s", msg)
    return {"status": "error", "message": msg}
