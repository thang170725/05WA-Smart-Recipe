"""
AIAssistantService — facade public cho FastAPI routes.

Contract API (Phase 3/4 update):
  - stream_pipeline(input_text, thread_id) → async generator SSE events
      Normal turn:
        * {type: "workflow", node, status, label, message}
        * {type: "answer", status, reply}
      Interrupt turn (ask_user):
        * {type: "ask_user", question, options, ask_count}
      Interrupt turn (confirm_gate):
        * {type: "confirm", question, staged_actions, options}

  - resume_pipeline(thread_id, user_reply) → async generator SSE events
      Tiếp tục graph đang interrupt với câu trả lời của user.

  - confirm_pending_action(action_id) → dict [backward-compat]

LangGraph interrupt/resume:
  - Mỗi user ↔ thread_id riêng (f"user-{user_id}")
  - graph được compile với MemorySaver checkpointer
  - astream() với stream_mode="updates" + config={"configurable": {"thread_id": ...}}
"""

from __future__ import annotations

import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

import json
import asyncio

from typing import Any, Optional

from langchain_core.messages import HumanMessage
from langgraph.types import Command
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.ai.ai_assistant_service.app.config.settings import (
    get_llm,
    DEFAULT_MAX_ITERATIONS,
    DEFAULT_MAX_RETRIEVAL_RETRIES,
    DEFAULT_MAX_EXECUTION_STEPS,
    DEFAULT_LLM_OPTION,
    DEFAULT_LOCAL_MODEL,
    format_llm_error,
    can_fallback_to_gemini,
)
from backend.modules.ai.ai_assistant_service.app.graph.builder import build_agent_graph
from backend.modules.ai.ai_assistant_service.app.graph.nodes.execute import (
    PENDING_ACTIONS,
    run_pending_write_action,
)
from backend.modules.ai.ai_assistant_service.app.workflow.workflow_events import (
    build_workflow_event,
    infer_next_running_node,
)
from backend.modules.ai.ai_assistant_service.app.utils import trace


__all__ = ["AIAssistantService", "PENDING_ACTIONS"]

# ── Singleton graph (compile once, dùng lại với nhiều thread_id) ──
_AGENT_GRAPH = None

def _get_graph():
    global _AGENT_GRAPH
    if _AGENT_GRAPH is None:
        _AGENT_GRAPH = build_agent_graph()
    return _AGENT_GRAPH


class AIAssistantService:
    """Service khởi tạo LLM + dùng graph singleton với checkpointer."""

    def __init__(
        self,
        current_user: Any = None,
        db: Optional[AsyncSession] = None,
        option: str = DEFAULT_LLM_OPTION,
        name_local: str = DEFAULT_LOCAL_MODEL,
        temperature: float = 0.3,
        max_iterations: int = DEFAULT_MAX_ITERATIONS,
        max_retrieval_retries: int = DEFAULT_MAX_RETRIEVAL_RETRIES,
        max_execution_steps: int = DEFAULT_MAX_EXECUTION_STEPS,
    ):
        self.current_user = current_user
        self.db = db
        self.max_iterations = max_iterations
        self.max_retrieval_retries = max_retrieval_retries
        self.max_execution_steps = max_execution_steps
        self.option = option
        self.name_local = name_local if option == "local" else "model API key"
        self.temperature = temperature
        self.llm = get_llm(
            option=option,
            name_local=name_local,
            temperature=temperature,
        )
        self.graph = _get_graph()

    def _thread_id(self) -> str:
        user_id = getattr(self.current_user, "id", None)
        return f"user-{user_id}" if user_id is not None else "anon"

    def _graph_config(self) -> dict:
        """
        Config trả lời câu hỏi: Trong lần chạy này, Agent được cấp những tài nguyên nào để thực hiện công việc?
            State trả lời câu hỏi: Agent đang xử lý đến đâu và đang có dữ liệu gì?
        """
        return {
            "configurable": {
                "thread_id": self._thread_id(),
                "db": self.db,
                "llm": self.llm,
                "current_user": self.current_user,
            }
        }

    def _switch_to_gemini(self) -> None:
        logger.warning("[AIAssistant] Fallback local → Gemini.")
        self.option = "key"
        self.name_local = "gemini"
        self.llm = get_llm(option="key", temperature=self.temperature)

    # =========================================================================
    # Build initial AgentState
    # =========================================================================
    def _build_initial_state(self, text: str) -> dict:
        '''
        Khởi tại trạng thái ban đầu cho langgraph trước khi bắt đầu chạy agent
        (chuẩn bị toàn bộ dữ liệu cần thiết để agent xử lý câu hỏi đó)
        '''
        user_id = getattr(self.current_user, "id", None)
        return {
            # 1. thông tin người dùng và hội thoại
            "user_id": int(user_id) if user_id is not None else 0, # id người dùng
            "thread_id": self._thread_id(), # id phiên hội thoại
            "user_query": text, # câu hỏi gốc của người dùng
            "rewritten_query": text, # viết lại câu hỏi gốc của người dùng, ban đầu là câu gốc của người dùng
            "current_query": text, # câu hiện tại được xử lý trong workflow 
            "messages": [HumanMessage(content=text)], # lưu lịch sử tin nhắn theo cấu trúc message của langchain

            # 2. nhóm phân tích ý định và làm rõ câu hỏi
            "intent": "", # ý định mà agent xác định từ câu hỏi của người dùng
            "clarify_question": None, # câu hỏi agent muốn hỏi lại người dùng khi thiếu thông tin
            "clarify_options": [], # những lựa chọn gợi ý để người dùng trả lời
            "ask_count": 0, # số lần agent đã yêu cầu người dùng làm rõ thông tin

            # 3. nhóm dữ liệu retrieval
            "docs": [], # những tài liệu được truy xuất từ nguồn dữ 
            "retrieved_tools": [], # các công cụ tìm được trong quá trình tìm kiếm tool
            "active_tools": [], # những công cụ được lựa chọn để sử dụng
            "retrieval_history": [], # lịch sử các lần retrieval
            "query_history": [], # lịch sử các câu truy vấn đã được sử dụng
            "files": [], # danh sách các file liên quan đến yêu cầu

            # 4. nhóm lập kế hoạch và quản lý nhiệm vụ
            "plan": [], # kế hoạch các bước agent cần thực hiện
            "task_status": {}, # trạng thái của từng nhiệm vụ
            "task_results": {}, # kết quả của từng nhiệm vụ
            "step_count": {}, # số lần thực hiện hoặc số bước theo dõi cho từng nhiệm vụ

            # 5. nhóm thực thi tool và kiểm soát hành động
            "staged_actions": [], # danh sách hành động đã được chuẩn bị nhưng chưa thực thi hoặc đang chờ xác nhận
            "approved_action_ids": [], # danh sách id hành động mà người dùng đã đồng ý thực hiện
            "tool_calls": [], # lưu các yêu cầu gọi tool mà agent tạo ra
            "tool_results": [], # lưu kết quả trả về từ các lần gọi tool
            "used_tools": [], # theo dõi các tool đã được sử dụng
            "decision": None, # lưu quyết định của agent hoặc node ra cây quyết định
            "decision_validation": None, # lưu kết quả kiểm tra tính hợp lệ của quyết định
            "result_validation": None, # lưu kết quả đầu ra sau khi thực thi

            # 6. nhóm kiểm soát vòng lặp và giới hạn agent
            "iteration": 0, # tổng số vòng lặp agent
            "retrieval_iteration": 0, # số vòng lặp tìm kiếm công cụ
            "execution_iteration": 0, # số vòng lặp thực thi
            "replan_count": 0, # số lần agent phải lập lại kế hoạch
            "max_iterations": self.max_iterations, # giới hạn số vòng lặp tổng thể
            "max_retrieval_retries": self.max_retrieval_retries, # giới hạn số lần thử retrieval lại
            "max_execution_steps": self.max_execution_steps, # giới hạn số bước thực thi

            # 7. nhóm tiến trình và kết quả cuối cùng
            "progress": "Đang tiếp nhận yêu cầu...", # thông báo trạng thái để frontend có thể hiển thị tiến trình
            "final_status": None, # trạng thái kết thúc của agent
            "final_message": None, # thông báo hoặc nội dung trả về cuối cùng cho người dùng
            "final_answer": None,
            "action_id": None, # id hành động liên quan đến kết quả xử lý 
        }

    def _extract_final_response(self, final_state: dict) -> dict[str, Any]:
        """Ghép payload trả về SSE answer event."""
        status = (final_state or {}).get("final_status") or "SUCCESS"
        message = (final_state or {}).get("final_message")

        if not message:
            for msg in reversed((final_state or {}).get("messages") or []):
                if getattr(msg, "type", None) == "ai":
                    content = getattr(msg, "content", "")
                    if isinstance(content, str) and content.strip():
                        message = content.strip()
                        break
            message = message or "Xin lỗi, mình chưa xử lý được yêu cầu này."

        response: dict[str, Any] = {"status": status, "message": message}
        if (final_state or {}).get("action_id"):
            response["action_id"] = final_state["action_id"]
        return response

    # =========================================================================
    # Streaming SSE — new turn
    # =========================================================================
    async def stream_pipeline(self, input_text: str, *, _fallback_tried: bool = False):
        """
        Async generator cho StreamingResponse.

        Yields SSE events:
          1. workflow events (running → completed) theo từng node
          2. Khi graph hit interrupt:
               - ask_user  → {type: "ask_user", question, options}
               - confirm   → {type: "confirm", question, staged_actions, options}
          3. answer event cuối (khi không interrupt)
        """
        text = (input_text or "").strip()
        if not text:
            yield build_workflow_event("done", "completed")
            yield {
                "type": "answer",
                "status": "SUCCESS",
                "reply": "Bạn muốn hỏi gì về dinh dưỡng hoặc luyện tập?",
            }
            return

        user_label = (
            getattr(self.current_user, "email", None)
            or getattr(self.current_user, "id", None)
        )
        trace.banner(
            "PIPELINE START (stream)",
            user=user_label,
            prompt=text,
            thread_id=self._thread_id(),
            option=self.option,
            llm=self.name_local,
        )

        # 1. chuẩn bị toàn bộ khung dữ liệu để agent xử lý
        initial_state = self._build_initial_state(text)

        final_state: dict = {}

        try:
            yield build_workflow_event("intake", "running")

            async for event in self.graph.astream(
                initial_state,
                config=self._graph_config(),
                stream_mode="updates",
            ):
                if not event:
                    continue

                # ── LangGraph interrupt ──
                # Khi interrupt() được gọi trong node, graph emit __interrupt__ event
                if "__interrupt__" in event:
                    interrupt_data = event["__interrupt__"]
                    # interrupt_data là list[Interrupt]
                    if interrupt_data:
                        payload = interrupt_data[0].value if hasattr(interrupt_data[0], "value") else interrupt_data[0]
                        yield build_workflow_event("done", "completed")
                        # Xác định loại interrupt
                        interrupt_type = payload.get("type", "ask_user") if isinstance(payload, dict) else "ask_user"
                        if interrupt_type == "confirm":
                            yield {
                                "type": "confirm",
                                "question": payload.get("question", "Bạn có muốn thực hiện thao tác này?") if isinstance(payload, dict) else str(payload),
                                "staged_actions": payload.get("staged_actions", []) if isinstance(payload, dict) else [],
                                "options": payload.get("options", ["Xác nhận", "Hủy"]) if isinstance(payload, dict) else ["Xác nhận", "Hủy"],
                            }
                        else:
                            yield {
                                "type": "ask_user",
                                "question": payload.get("question", "Bạn muốn mình hỗ trợ gì?") if isinstance(payload, dict) else str(payload),
                                "options": payload.get("options", []) if isinstance(payload, dict) else [],
                                "ask_count": payload.get("ask_count", 0) if isinstance(payload, dict) else 0,
                            }
                    return  # Dừng stream, chờ resume

                for node_name, node_update in event.items():
                    if str(node_name).startswith("__"):
                        continue

                    progress_msg = None
                    if isinstance(node_update, dict):
                        final_state.update(node_update)
                        progress_msg = node_update.get("progress")

                    logger.info("[STREAM NODE] %s progress=%s", node_name, progress_msg)

                    yield build_workflow_event(node_name, "completed", message=progress_msg)

                    next_node = infer_next_running_node(node_name, final_state)
                    if next_node:
                        yield build_workflow_event(next_node, "running")

            # ── Graph kết thúc bình thường ──
            response = self._extract_final_response(final_state)

            yield build_workflow_event("done", "completed")

            answer_event: dict[str, Any] = {
                "type": "answer",
                "status": response["status"],
                "reply": response["message"],
                "action_id": response.get("action_id"),
            }
            if response.get("status") == "ASK_USER":
                answer_event["clarify_options"] = final_state.get("clarify_options") or []
                answer_event["clarify_question"] = final_state.get("clarify_question")
            yield answer_event

        except Exception as exc:
            logger.exception("[AIAssistant] Graph stream lỗi.")

            yield build_workflow_event("done", "error")
            yield {
                "type": "answer",
                "status": "ERROR",
                "reply": format_llm_error(exc),
            }

    # =========================================================================
    # Resume sau interrupt (ask_user / confirm_gate)
    # =========================================================================
    async def resume_pipeline(self, user_reply: str, *, _fallback_tried: bool = False):
        """
        Tiếp tục graph đang interrupt với câu trả lời của user.

        user_reply: chuỗi user nhập (chọn option hoặc gõ tự do).
        Yields SSE events giống stream_pipeline.
        """
        trace.banner(
            "PIPELINE RESUME",
            thread_id=self._thread_id(),
            reply=str(user_reply)[:80],
        )

        # db + llm (session mới) được nạp lại qua self._graph_config() ở astream bên dưới.
        # LangGraph Command(resume=value) sẽ inject value vào interrupt()
        resume_command = Command(resume=user_reply)
        final_state: dict = {}

        try:
            yield build_workflow_event("resume", "running")

            async for event in self.graph.astream(
                resume_command,
                config=self._graph_config(),
                stream_mode="updates",
            ):
                if not event:
                    continue

                # Interrupt lồng nhau (vd: ask_user → confirm_gate)
                if "__interrupt__" in event:
                    interrupt_data = event["__interrupt__"]
                    if interrupt_data:
                        payload = interrupt_data[0].value if hasattr(interrupt_data[0], "value") else interrupt_data[0]
                        yield build_workflow_event("done", "completed")
                        interrupt_type = payload.get("type", "ask_user") if isinstance(payload, dict) else "ask_user"
                        if interrupt_type == "confirm":
                            yield {
                                "type": "confirm",
                                "question": payload.get("question", "Bạn có muốn thực hiện thao tác này?") if isinstance(payload, dict) else str(payload),
                                "staged_actions": payload.get("staged_actions", []) if isinstance(payload, dict) else [],
                                "options": payload.get("options", ["Xác nhận", "Hủy"]) if isinstance(payload, dict) else ["Xác nhận", "Hủy"],
                            }
                        else:
                            yield {
                                "type": "ask_user",
                                "question": payload.get("question", "Bạn muốn mình hỗ trợ gì?") if isinstance(payload, dict) else str(payload),
                                "options": payload.get("options", []) if isinstance(payload, dict) else [],
                                "ask_count": payload.get("ask_count", 0) if isinstance(payload, dict) else 0,
                            }
                    return

                for node_name, node_update in event.items():
                    if str(node_name).startswith("__"):
                        continue

                    progress_msg = None
                    if isinstance(node_update, dict):
                        final_state.update(node_update)
                        progress_msg = node_update.get("progress")

                    yield build_workflow_event(node_name, "completed", message=progress_msg)
                    next_node = infer_next_running_node(node_name, final_state)
                    if next_node:
                        yield build_workflow_event(next_node, "running")

            response = self._extract_final_response(final_state)
            yield build_workflow_event("done", "completed")
            answer_event: dict[str, Any] = {
                "type": "answer",
                "status": response["status"],
                "reply": response["message"],
            }
            yield answer_event

        except Exception as exc:
            logger.exception("[AIAssistant] Resume lỗi.")
            yield build_workflow_event("done", "error")
            yield {
                "type": "answer",
                "status": "ERROR",
                "reply": format_llm_error(exc),
            }

    # =========================================================================
    # Non-streaming (CLI / test)
    # =========================================================================
    async def run_pipline(self, input_text: str) -> dict:
        text = (input_text or "").strip()
        if not text:
            return {"status": "SUCCESS", "message": "Bạn muốn hỏi gì về dinh dưỡng hoặc luyện tập?"}

        initial_state = self._build_initial_state(text)
        final_state: dict = {}

        try:
            async for event in self.graph.astream(
                initial_state,
                config=self._graph_config(),
                stream_mode="updates",
            ):
                if not event:
                    continue
                if "__interrupt__" in event:
                    # CLI không xử lý interrupt — trả thông báo
                    return {"status": "ASK_USER", "message": "Agent cần thêm thông tin từ bạn."}
                for node_name, node_update in event.items():
                    if str(node_name).startswith("__"):
                        continue
                    if isinstance(node_update, dict):
                        final_state.update(node_update)
        except Exception:
            logger.exception("[AIAssistant] Graph lỗi.")
            return {"status": "ERROR", "message": "AI hiện đang quá tải, vui lòng thử lại sau."}

        return self._extract_final_response(final_state)

    async def confirm_pending_action(self, action_id: str) -> dict:
        """Backward-compat: thực thi write tool từ /confirm route cũ."""
        return await run_pending_write_action(db=self.db, action_id=action_id)

async def main():
    assistant = AIAssistantService()

    input_text = "tôi muốn xem thông tin tài khoản của tôi"

    async for event in assistant.stream_pipeline(input_text):
        print(json.dumps(event, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())