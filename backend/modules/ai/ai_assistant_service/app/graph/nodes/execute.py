"""
Node — EXECUTE (Tool Execution) — Phase 2/3 update.

Thay đổi so với Phase 1:
  - READ tools: thực thi ngay như cũ
  - WRITE tools: không treo PENDING_ACTIONS nữa; thay vào đó
    append vào staged_actions và set final_status=NEED_CONFIRM
    → builder sẽ route sang confirm_gate (LangGraph interrupt)
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.runnables import RunnableConfig


from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils.helpers import serialize_tool_result
from backend.modules.ai.ai_assistant_service.app.utils import trace
from backend.modules.ai.ai_assistant_service.tools.registry import (
    TOOL_EXECUTORS,
    is_write_tool,
)

logger = logging.getLogger(__name__)

# ── Giữ lại PENDING_ACTIONS cho backward-compat với /confirm route cũ ──
# Sẽ dần loại bỏ khi Phase 3 ổn định.
PENDING_ACTIONS: dict[str, dict[str, Any]] = {}


async def execute_tools_node(state: AgentState, config: RunnableConfig) -> dict:
    last_msg = state["messages"][-1] if state.get("messages") else None
    tool_calls = (getattr(last_msg, "tool_calls", None) or []) if last_msg else []
    if not tool_calls and state.get("decision"):
        tool_calls = state["decision"].get("tool_calls") or []

    execution_iteration = int(state.get("execution_iteration") or 0) + 1
    history_calls = list(state.get("tool_calls") or [])
    history_results = list(state.get("tool_results") or [])
    used_tools = list(state.get("used_tools") or [])
    staged_actions = list(state.get("staged_actions") or [])

    trace.banner(
        "NODE 4.1 · EXECUTE (execute_tool)",
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

    db = config["configurable"]["db"]
    user = config["configurable"]["current_user"]
    user_id = getattr(user, "id", None)
    llm = config["configurable"]["llm"]

    tool_messages: list[ToolMessage] = []
    has_write = False

    for tc in tool_calls:
        name = tc.get("name")
        args = tc.get("args") or {}
        call_id = tc.get("id") or str(uuid.uuid4())

        history_calls.append({
            "name": name,
            "args": args,
            "execution_iteration": execution_iteration,
        })
        if name and name not in used_tools:
            used_tools.append(name)

        # ── WRITE: thêm vào staged_actions, route sang confirm_gate ──
        if is_write_tool(name):
            has_write = True

            # Tạo preview text thân thiện
            preview_parts = [f"{k}={v}" for k, v in args.items()]
            preview = f"{name}({', '.join(preview_parts)})"

            # Gán idempotency key để tránh double-submit
            idempotency_key = f"{user_id}:{name}:{str(sorted(args.items()))}"

            staged_actions.append({
                "id": str(uuid.uuid4()),
                "tool": name,
                "args": args,
                "preview": preview,
                "risk": "high" if "delete" in name.lower() else "low",
                "idempotency_key": idempotency_key,
            })
            trace.step(
                "WRITE tool=%s → staged (confirm_gate). staged_total=%d",
                name,
                len(staged_actions),
            )
            continue  # Không execute ngay

        # ── READ: thực thi ngay ──
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

        history_results.append({
            "name": name,
            "args": args,
            "result": result,
            "execution_iteration": execution_iteration,
        })
        tool_messages.append(
            ToolMessage(
                content=serialize_tool_result(result),
                tool_call_id=call_id,
                name=name,
            )
        )

    # Nếu có WRITE → báo cần confirm (confirm_gate sẽ xử lý)
    if has_write:
        trace.step("Có staged_actions → route sang confirm_gate")
        out = {
            "tool_calls": history_calls,
            "used_tools": used_tools,
            "execution_iteration": execution_iteration,
            "staged_actions": staged_actions,
            "final_status": "NEED_CONFIRM",
            "progress": "Đang chuẩn bị xác nhận thao tác...",
        }
        if tool_messages:  # có READ lẫn WRITE trong cùng turn
            out["messages"] = tool_messages
            out["tool_results"] = history_results
        return out

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
    """
    Backward-compat: vẫn giữ cho /confirm route cũ trong khi chuyển tiếp.
    Sau khi Phase 3 interrupt ổn định, route + hàm này sẽ xóa.
    """
    pending = PENDING_ACTIONS.get(action_id)
    if not pending:
        trace.warn("Confirm thất bại: action_id=%s không tồn tại", action_id)
        return {"status": "error", "message": "Yêu cầu không tồn tại hoặc đã hết hạn."}

    tool_name = pending["intent"]
    tool_args = pending["new_content"] or {}
    user_id = pending["user_id"]

    trace.banner("CONFIRM WRITE (legacy)", action_id=action_id, tool=tool_name)
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
        return {"status": "success", "message": result.get("message") or "Đã cập nhật thành công."}

    msg = (result or {}).get("message", "Cập nhật thất bại.") if isinstance(result, dict) else "Cập nhật thất bại."
    return {"status": "error", "message": msg}
