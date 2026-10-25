"""
Node ASK_USER — Phase 4: Interrupt thật khi agent cần hỏi thêm thông tin.

Khác với Phase 1 (unclear → text thô), Phase 4 dùng langgraph interrupt()
để tạm dừng graph, SSE gửi event type=ask_user xuống FE, FE hiển thị nút
quick-reply, user chọn → resume graph với answer.

Flow:
  router_agent → ask_user → [INTERRUPT] → (resume) → execute_tool / agent_return_result

Trigger khi:
  - Router Agent cần thêm thông tin để chọn đúng tool (vd: "ngày nào?")
  - No-Tool Evaluator thấy UNKNOWN
  - Intake unclear nhưng chưa đến giới hạn ask_count
"""

from __future__ import annotations

import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.types import interrupt

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.design_decisions import MAX_ASK
from backend.modules.ai.ai_assistant_service.app.utils import trace


async def ask_user_node(state: AgentState) -> dict:
    """
    Dừng graph, gửi câu hỏi làm rõ xuống user, chờ user trả lời.

    Payload interrupt:
      {
        "question": str,
        "options": list[str],      # quick-reply choices (có thể rỗng)
        "ask_count": int,
      }

    Sau interrupt(), LangGraph resume với giá trị user nhập → state["user_reply"].
    Node sẽ ghi user_reply vào messages và reset clarify_question.
    """
    ask_count = int(state.get("ask_count") or 0)
    clarify_question = state.get("clarify_question") or "Bạn có thể cho mình biết thêm thông tin không?"
    clarify_options = list(state.get("clarify_options") or [])

    trace.banner(
        "NODE · ASK_USER",
        ask_count=f"{ask_count}/{MAX_ASK}",
        question=clarify_question[:80],
        n_options=len(clarify_options),
    )

    # Giới hạn: nếu đã hỏi quá nhiều → skip interrupt, trả lời thẳng
    if ask_count >= MAX_ASK:
        trace.warn("Đã đạt MAX_ASK=%d — bỏ qua interrupt, trả lời luôn.", MAX_ASK)
        return {
            "ask_count": ask_count,
            "final_status": "ASK_USER",
            "final_message": clarify_question,
            "clarify_question": clarify_question,
            "clarify_options": clarify_options,
        }

    # ── INTERRUPT: tạm dừng graph, chờ user trả lời ──
    user_reply: str = interrupt({
        "question": clarify_question,
        "options": clarify_options,
        "ask_count": ask_count,
    })

    trace.step("User trả lời interrupt: %s", str(user_reply)[:120])

    # Ghi câu trả lời của user vào messages để context tiếp theo biết
    updated_messages = [HumanMessage(content=str(user_reply))]

    return {
        "ask_count": ask_count + 1,
        "user_query": str(user_reply),                    # override query cho vòng tiếp
        "rewritten_query": str(user_reply),
        "current_query": str(user_reply),
        "clarify_question": None,                          # reset
        "clarify_options": [],
        "messages": updated_messages,
        "final_status": None,
        "final_message": None,
        "progress": "Đã nhận thông tin — đang xử lý...",
    }
