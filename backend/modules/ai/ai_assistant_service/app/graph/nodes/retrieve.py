"""
Node — RETRIEVER (Tool RAG).

Dùng current_query (không phải user_query gốc) để embed → Top-K tools.
Lưu retrieval_history để debug và chống loop vô ích.
"""

from __future__ import annotations

# 
# ====== nơi setup logging =====
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
# ===== nơi import thư viện =======
#
import os

from dotenv import load_dotenv
load_dotenv()

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils import trace
from backend.modules.ai.ai_assistant_service.tools.rag import retrieve_tools

#
# ======== nơi setup constraint ========
#
DEFAULT_TOOL_TOP_K = os.getenv('DEFAULT_TOOL_TOP_K', default=5)
DEFAULT_RAG_SCORE_THRESHOLD = os.gêtnv('DEFAULT_RAG_SCORE_THRESHOLD', default=0.5)

#
#
#
async def retrieve_tools_node(state: AgentState) -> dict:
    """
    Trạm RAG: embed current_query → cosine similarity → Top-K BaseTool.
    """
    current_query = (state.get("current_query") or state.get("user_query")or "").strip()
    db = state["db"]
    history = list(state.get("retrieval_history") or [])

    trace.banner("NODE 2 · RETRIEVE (Tool RAG)", query=current_query)

    try:
        tools = await retrieve_tools(
            db=db,
            user_query=current_query,
            top_k=DEFAULT_TOOL_TOP_K,
            threshold=DEFAULT_RAG_SCORE_THRESHOLD,
        )
    except Exception:
        logger.exception("[Node:Retrieve] RAG failed")
        trace.error("Lỗi RAG — tiếp tục với active_tools rỗng.")
        tools = []

    names = [t.name for t in tools]
    history.append({"query": current_query, "tools": names})

    if names:
        trace.step("Top-K tools: %s", names)
    else:
        trace.warn(
            "Không retrieve được tool nào (DB trống / score thấp / chưa sync). "
            "Agent sẽ quyết định FINAL_ANSWER hoặc NEED_RETRIEVAL."
        )

    return {
        "active_tools": tools,
        "retrieved_tools": tools,
        "retrieval_history": history,
        "progress": "Đang xác định phương án xử lý...",
    }
