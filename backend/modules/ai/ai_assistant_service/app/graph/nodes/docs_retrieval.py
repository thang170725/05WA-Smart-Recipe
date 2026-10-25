"""
Node 2: DOCS RETRIEVAL

Chỉ chạy với intent=general_qa.
Hiện chưa có kho docs thật — luôn trả list rỗng (Responder dùng kiến thức model).
Cắm docs sau qua `retrieve_docs(query, k)` mà không đổi flow.
"""

from __future__ import annotations

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils import trace


def retrieve_docs(query: str, k: int = 5) -> list[dict]:
    """
    Hook retrieval docs (Phase 7).

    Hiện tại kho rỗng → []. Sau này: embed query, cosine Top-K từ vector store.
    Mỗi phần tử: {id, title, content, score}.
    """
    _ = (query, k)
    return []


async def docs_retrieval_node(state: AgentState) -> dict:
    query = (state.get("rewritten_query") or state.get("user_query") or "").strip()
    docs = retrieve_docs(query, k=5)

    trace.banner("NODE 2 · DOCS RETRIEVAL", query=query[:80], n_docs=len(docs))
    return {
        "docs": docs,
        "progress": (
            f"Đã tìm thấy {len(docs)} tài liệu tham khảo."
            if docs
            else "Chưa có tài liệu nội bộ — trả lời bằng kiến thức chung."
        ),
    }
