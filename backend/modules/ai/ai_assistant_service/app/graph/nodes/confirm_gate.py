"""
Node CONFIRM_GATE — Phase 3: Xác nhận thao tác ghi/xuất trước khi thực thi.

Dùng LangGraph interrupt() để tạm dừng, FE hiển thị modal xác nhận,
user chọn Xác nhận / Hủy → resume graph.

Lợi thế so với cơ chế cũ (PENDING_ACTIONS + /confirm route):
  - Không cần route phụ /confirm
  - State graph nhất quán, không rò rỉ action_id giữa các request
  - Có thể timeout / cancel tự động khi graph expire

Vị trí trong graph:
  execute_tool (write) → confirm_gate → [INTERRUPT] → (resume) → commit / cancel
"""

from __future__ import annotations

import logging
import uuid

from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from langchain_core.messages import AIMessage
from langgraph.types import interrupt
from langchain_core.runnables import RunnableConfig

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils import trace
from backend.modules.ai.ai_assistant_service.tools.registry import TOOL_EXECUTORS


async def confirm_gate_node(state: AgentState, config: RunnableConfig) -> dict:
    """
    Gate chặn thao tác ghi chờ xác nhận user.

    Trước interrupt:
      - Lấy staged_actions từ state (đã được execute_tool chuẩn bị)
      - Gửi preview xuống FE qua interrupt payload

    Sau interrupt (resume):
      - user_reply = "confirm" → thực thi tất cả staged_actions
      - user_reply = "cancel"  → hủy, thông báo
    """
    staged_actions = list(state.get("staged_actions") or [])
    db = config["configurable"]["db"]
    user = config["configurable"]["current_user"]
    user_id = getattr(user, "id", None)

    trace.banner(
        "NODE · CONFIRM_GATE",
        n_staged=len(staged_actions),
    )

    if not staged_actions:
        trace.warn("Không có staged_actions — bỏ qua confirm gate.")
        return {
            "final_status": "ERROR",
            "final_message": "Không có thao tác nào cần xác nhận.",
        }

    # Build preview text cho user
    preview_lines = []
    for action in staged_actions:
        tool_name = action.get("tool", "?")
        preview = action.get("preview", str(action.get("args", {})))
        risk = action.get("risk", "low")
        icon = "⚠️" if risk == "high" else "📝"
        preview_lines.append(f"{icon} {tool_name}: {preview}")

    preview_text = "\n".join(preview_lines)
    confirm_question = (
        f"Mình sắp thực hiện các thay đổi sau:\n{preview_text}\n\n"
        "Bạn có chắc muốn tiếp tục không?"
    )

    # ── INTERRUPT: chờ user xác nhận ──
    user_reply: str = interrupt({
        "type": "confirm",
        "question": confirm_question,
        "staged_actions": staged_actions,
        "options": ["Xác nhận", "Hủy"],
    })

    user_reply_str = str(user_reply).strip().lower()
    trace.step("User reply confirm_gate: %s", user_reply_str[:60])

    # Hủy
    if user_reply_str in {"cancel", "hủy", "huy", "no", "không", "khong", "n"}:
        trace.step("User hủy thao tác.")
        return {
            "staged_actions": [],
            "final_status": "SUCCESS",
            "final_message": "Đã hủy thao tác. Dữ liệu không thay đổi.",
            "progress": "Đã hủy.",
        }

    # Xác nhận → thực thi
    trace.step("User xác nhận — đang thực thi %d staged_actions...", len(staged_actions))
    results = []
    errors = []

    for action in staged_actions:
        tool_name = action.get("tool", "")
        args = action.get("args") or {}
        executor = TOOL_EXECUTORS.get(tool_name)

        if executor is None:
            errors.append(f"Không tìm thấy executor cho '{tool_name}'.")
            continue

        try:
            result = await executor(db=db, user_id=user_id, **args)
            if isinstance(result, dict) and result.get("status") == "success":
                results.append(result.get("message") or f"✅ {tool_name} thành công.")
            else:
                msg = (result or {}).get("message", f"Lỗi khi chạy {tool_name}.") if isinstance(result, dict) else str(result)
                errors.append(msg)
        except Exception as exc:
            logger.exception("[ConfirmGate] Tool '%s' lỗi.", tool_name)
            errors.append(f"Lỗi khi chạy {tool_name}: {exc}")

    if errors and not results:
        final_msg = "Thực thi thất bại:\n" + "\n".join(f"- {e}" for e in errors)
        status = "ERROR"
    elif errors:
        final_msg = (
            "Một số thao tác thành công:\n" + "\n".join(f"- {r}" for r in results)
            + "\nMột số lỗi:\n" + "\n".join(f"- {e}" for e in errors)
        )
        status = "SUCCESS"
    else:
        final_msg = "Đã thực hiện thành công:\n" + "\n".join(f"- {r}" for r in results)
        status = "SUCCESS"

    trace.step("ConfirmGate done: status=%s", status)
    return {
        "staged_actions": [],
        "final_status": status,
        "final_message": final_msg,
        "messages": [AIMessage(content=final_msg)],
        "progress": "Đã hoàn tất thao tác.",
    }
