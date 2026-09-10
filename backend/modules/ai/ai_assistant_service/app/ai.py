"""
AIAssistantService — facade public cho FastAPI routes.

Contract API:
  - run_pipline(input_text) → {status, message, action_id?}
  - stream_pipeline(input_text) → async generator SSE events
      * {type: "workflow", node, status, label, message}
      * {type: "answer", status, reply, action_id?}
  - confirm_pending_action(action_id) → {status, message}
  - PENDING_ACTIONS (re-export) để routes kiểm tra ownership

Bên trong: LangGraph
  rewrite → retrieve → agent → (execute → result_evaluator | decision_validator)
"""

from __future__ import annotations

#
# ===== nơi setup logging ======
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
# ===== nơi import thư viện ======
#
from typing import Any, Optional

from langchain_core.messages import HumanMessage
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


class AIAssistantService:
    """Service khởi tạo LLM + compile graph một lần, rồi chạy pipeline theo request."""

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
        if self.option == "local":
            self.name_local = name_local
        else:
            self.name_local = "model API key"

        self.temperature = temperature
        self.llm = get_llm(
            option=option,
            name_local=name_local,
            temperature=temperature,
        )
        self.graph = build_agent_graph()

    def _switch_to_gemini(self) -> None:
        """Chuyển LLM runtime sang Gemini (fallback khi Ollama crash)."""
        logger.warning(
            "[AIAssistant] Fallback local → Gemini (Ollama lỗi / OOM)."
        )
        self.option = "key"
        self.name_local = "gemini"
        self.llm = get_llm(
            option="key",
            temperature=self.temperature,
        )

    # =========================================================================
    # ===== Build initial AgentState (dùng chung run + stream) ================
    # =========================================================================
    def _build_initial_state(self, text: str) -> dict:
        return {
            # Original + retrieval
            "user_query": text,
            "current_query": text,
            "query_history": [],
            "retrieved_tools": [],
            "active_tools": [],
            "retrieval_history": [],

            # Conversation
            "messages": [HumanMessage(content=text)],

            # Runtime
            "db": self.db,
            "current_user": self.current_user,
            "llm": self.llm,

            # Decisions / validations
            "decision": None,
            "decision_validation": None,
            "result_validation": None,

            # Tool history
            "tool_calls": [],
            "tool_results": [],
            "used_tools": [],

            # Loop control
            "iteration": 0,
            "retrieval_iteration": 0,
            "execution_iteration": 0,
            "max_iterations": self.max_iterations,
            "max_retrieval_retries": self.max_retrieval_retries,
            "max_execution_steps": self.max_execution_steps,

            # Progress / output
            "progress": "Đang phân tích yêu cầu...",
            "final_status": None,
            "final_message": None,
            "action_id": None,
        }

    def _extract_final_response(self, final_state: dict) -> dict[str, Any]:
        """Ghép payload trả về FastAPI / SSE answer event."""
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

        response: dict[str, Any] = {
            "status": status,
            "message": message,
        }
        if (final_state or {}).get("action_id"):
            response["action_id"] = final_state["action_id"]
        return response

    # =========================================================================
    # ===== Non-streaming (CLI / fallback) ====================================
    # =========================================================================
    async def run_pipline(self, input_text: str) -> dict:
        text = (input_text or "").strip()
        if not text:
            return {
                "status": "SUCCESS",
                "message": "Bạn muốn hỏi gì về dinh dưỡng hoặc luyện tập?",
            }

        user_label = getattr(self.current_user, "email", None) or getattr(
            self.current_user, "id", None
        )
        trace.banner(
            "PIPELINE START",
            user=user_label,
            prompt=text,
            max_iterations=self.max_iterations,
            max_retrieval=self.max_retrieval_retries,
            max_execution=self.max_execution_steps,
            option=self.option,
            llm=self.name_local,
        )

        initial_state = self._build_initial_state(text)
        logger.debug("INITIAL STATE keys: %s", list(initial_state.keys()))

        final_state: dict = {}

        try:
            async for event in self.graph.astream(
                initial_state,
                stream_mode="updates",
            ):
                logger.info("[WORKFLOW EVENT] %s", event)

                if not event:
                    continue

                for node_name, node_update in event.items():
                    logger.info("[WORKFLOW NODE] %s", node_name)
                    if isinstance(node_update, dict):
                        final_state.update(node_update)

        except Exception:
            logger.exception("[AIAssistant] Graph lỗi.")
            trace.error("Graph exception — xem stacktrace phía trên.")
            return {
                "status": "ERROR",
                "message": "AI hiện đang quá tải, vui lòng thử lại sau.",
            }

        response = self._extract_final_response(final_state)
        preview = response["message"]
        if len(preview) > 200:
            preview = preview[:200] + "..."

        trace.banner(
            "PIPELINE END",
            status=response["status"],
            action_id=response.get("action_id"),
            iterations=final_state.get("iteration"),
            retrieval_iteration=final_state.get("retrieval_iteration"),
            execution_iteration=final_state.get("execution_iteration"),
            progress=final_state.get("progress"),
            message=preview,
        )
        return response

    # =========================================================================
    # ===== Streaming SSE (frontend progress) =================================
    # =========================================================================
    async def stream_pipeline(self, input_text: str, *, _fallback_tried: bool = False):
        """
        Async generator cho StreamingResponse.

        Yields:
          1) workflow events (running → completed) theo từng node
          2) answer event cuối cùng

        Nếu Ollama crash và LLM_AUTO_FALLBACK=true → thử lại 1 lần với Gemini.
        """
        text = (input_text or "").strip()

        # ---- Empty prompt ----
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
            max_iterations=self.max_iterations,
            max_retrieval=self.max_retrieval_retries,
            max_execution=self.max_execution_steps,
            option=self.option,
            llm=self.name_local,
            fallback_tried=_fallback_tried,
        )

        initial_state = self._build_initial_state(text)
        final_state: dict = {}

        try:
            # ---- Bước đầu: báo frontend đang chạy rewrite ----
            yield build_workflow_event("rewrite", "running")

            async for event in self.graph.astream(
                initial_state,
                stream_mode="updates",
            ):
                if not event:
                    continue

                for node_name, node_update in event.items():
                    # Bỏ qua meta keys của LangGraph (nếu có)
                    if str(node_name).startswith("__"):
                        continue

                    # Merge state từ node vừa xong
                    progress_msg = None
                    if isinstance(node_update, dict):
                        final_state.update(node_update)
                        progress_msg = node_update.get("progress")

                    logger.info("[STREAM NODE] %s progress=%s", node_name, progress_msg)

                    # ---- Node vừa hoàn thành ----
                    yield build_workflow_event(
                        node_name,
                        "completed",
                        message=progress_msg,
                    )

                    # ---- Đoán node tiếp theo → emit running (UX) ----
                    next_node = infer_next_running_node(node_name, final_state)
                    if next_node:
                        yield build_workflow_event(next_node, "running")

            # ---- Kết thúc graph → answer ----
            response = self._extract_final_response(final_state)

            # Nếu agent đã bắt LLM lỗi → thử fallback Gemini (1 lần)
            if (
                response.get("status") == "ERROR"
                and not _fallback_tried
                and can_fallback_to_gemini(self.option)
            ):
                yield build_workflow_event(
                    "rewrite",
                    "running",
                    message="Ollama lỗi — đang chuyển sang Gemini...",
                )
                self._switch_to_gemini()
                async for event in self.stream_pipeline(
                    text,
                    _fallback_tried=True,
                ):
                    yield event
                return

            yield build_workflow_event("done", "completed")

            yield {
                "type": "answer",
                "status": response["status"],
                "reply": response["message"],
                "action_id": response.get("action_id"),
            }

            trace.banner(
                "PIPELINE END (stream)",
                status=response["status"],
                action_id=response.get("action_id"),
                iterations=final_state.get("iteration"),
            )

        except Exception as exc:
            logger.exception("[AIAssistant] Graph stream lỗi.")
            trace.error("Graph exception — xem stacktrace phía trên.")

            # ---- Auto fallback Gemini khi Ollama/graph nổ ----
            if not _fallback_tried and can_fallback_to_gemini(self.option):
                yield build_workflow_event(
                    "rewrite",
                    "running",
                    message="Ollama lỗi — đang chuyển sang Gemini...",
                )
                self._switch_to_gemini()
                async for event in self.stream_pipeline(
                    text,
                    _fallback_tried=True,
                ):
                    yield event
                return

            yield build_workflow_event("done", "error")

            yield {
                "type": "answer",
                "status": "ERROR",
                "reply": format_llm_error(exc),
            }

    async def confirm_pending_action(self, action_id: str) -> dict:
        """Thực thi thao tác ghi đã được user xác nhận."""
        return await run_pending_write_action(db=self.db, action_id=action_id)
