"""
AIAssistantService — facade public cho FastAPI routes.

Giữ nguyên contract API cũ:
  - run_pipline(input_text) → {status, message, action_id?}
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
#
#
from typing import Any, Optional, final

from langchain_core.messages import HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession


from backend.modules.ai.ai_assistant_service.app.config.settings import (
    get_llm,
    DEFAULT_MAX_ITERATIONS,
    DEFAULT_MAX_RETRIEVAL_RETRIES,
    DEFAULT_MAX_EXECUTION_STEPS,
    DEFAULT_LLM_OPTION,
    DEFAULT_LOCAL_MODEL,
)
from backend.modules.ai.ai_assistant_service.app.graph.builder import build_agent_graph
from backend.modules.ai.ai_assistant_service.app.graph.nodes.execute import (
    PENDING_ACTIONS,
    # run_pending_write_action,
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

        self.llm = get_llm(
            option=option,
            name_local=name_local,
            temperature=temperature,
        )
        self.graph = build_agent_graph()

    async def run_pipline(self, input_text: str) -> dict:
        text = (input_text or "").strip()
        if not text:
            return {"status": "SUCCESS", "message": "Bạn muốn hỏi gì về dinh dưỡng hoặc luyện tập?"}

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

        initial_state = {
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
        logger.debug(f"INITIAL STATE:\n {initial_state}")

        try:
            final_state = await self.graph.ainvoke(initial_state)
            logger.debug(f"FINAL STATE:\n {final_state}")
        except Exception:
            logger.exception("[AIAssistant] Graph lỗi.")
            trace.error("Graph exception — xem stacktrace phía trên.")
            return {
                "status": "ERROR",
                "message": "AI hiện đang quá tải, vui lòng thử lại sau.",
            }

        status = final_state.get("final_status") or "SUCCESS"
        message = final_state.get("final_message")

        if not message:
            for msg in reversed(final_state.get("messages") or []):
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
        if final_state.get("action_id"):
            response["action_id"] = final_state["action_id"]

        preview = message if len(message) <= 200 else message[:200] + "..."
        trace.banner(
            "PIPELINE END",
            status=status,
            action_id=response.get("action_id"),
            iterations=final_state.get("iteration"),
            retrieval_iteration=final_state.get("retrieval_iteration"),
            execution_iteration=final_state.get("execution_iteration"),
            progress=final_state.get("progress"),
            message=preview,
        )
        return response

    # async def confirm_pending_action(self, action_id: str) -> dict:
    #     """Thực thi thao tác ghi đã được user xác nhận."""
    #     return await run_pending_write_action(db=self.db, action_id=action_id)
