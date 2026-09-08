"""
Tool RAG — Dynamic Tool Retrieval trên MariaDB.

Flow:
  1. Embed câu hỏi user (Gemini Embedding, RETRIEVAL_QUERY)
  2. Load embeddings từ bảng `ai_tool_registry`
  3. Cosine similarity → Top-K (score >= threshold)
  4. Map tên → BaseTool trong TOOL_BY_NAME
"""

from __future__ import annotations

#
# ====== nơi setup logging ======
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
# ====== nơi import thư viện =====
#
import os
import numpy as np
import asyncio

from dotenv import load_dotenv
from typing import Sequence
from google import genai
from google.genai import types
from langchain_core.tools import BaseTool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sentence_transformers import SentenceTransformer

from backend.config.database import SessionLocal
from backend.modules.ai.ai_assistant_service.app.models import AIToolRegistryModel
from backend.modules.ai.ai_assistant_service.app.config.settings import (
    DEFAULT_TOOL_TOP_K,
    DEFAULT_RAG_SCORE_THRESHOLD,
)
from backend.modules.ai.ai_assistant_service.tools.registry import TOOL_BY_NAME

load_dotenv()


# ==============================
# ===== Config =================
# ==============================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", default=None) 
EMBEDDING_PROVIDER = os.getenv( "EMBEDDING_PROVIDER", "gemini", ).lower() 
MODEL_EMBEDDING_LOCAL_NAME = os.getenv( "MODEL_EMBEDDING_LOCAL_NAME", "AITeamVN/Vietnamese_Embedding_v2", ) 
EMBEDDING_MODEL = "gemini-embedding-2" 

# ===============================
# ========= Gemini ==============
# ===============================
_client = ( genai.Client(api_key=GOOGLE_API_KEY) if GOOGLE_API_KEY else None ) 

# ====================================
# ======= Local embedding model ======
# ====================================
_local_embedding_model = None 
def _get_local_embedding_model() -> SentenceTransformer: 
    """ Lazy load local embedding model. Model chỉ được load khi EMBEDDING_PROVIDER=local. """ 
    global _local_embedding_model 
    if _local_embedding_model is None: 
        _local_embedding_model = SentenceTransformer( MODEL_EMBEDDING_LOCAL_NAME ) 
    
    return _local_embedding_model 
    
# ==============================================
# ============== Embedding ======================
# ====================================== 
def embed_text( text: str, *, task_type: str = "RETRIEVAL_QUERY", ) -> list[float]: 
    """ 
    Biến text thành vector embedding. EMBEDDING_PROVIDER: 
    gemini → sử dụng Gemini API local → sử dụng Hugging Face model local task_type chỉ được sử dụng với Gemini. 
    Gemini: RETRIEVAL_QUERY → embed câu hỏi user lúc retrieve RETRIEVAL_DOCUMENT → embed document/tool description lúc sync DB Local: 
    Vietnamese_Embedding_v2 không sử dụng task_type. 
    """ 
    if EMBEDDING_PROVIDER == "gemini": 
        if not _client: 
            raise RuntimeError( "GOOGLE_API_KEY thiếu — không thể tạo embedding." ) 
        response = _client.models.embed_content( model=EMBEDDING_MODEL, contents=text, config=types.EmbedContentConfig( task_type=task_type, ), ) 
        return list(response.embeddings[0].values)  
    
    if EMBEDDING_PROVIDER == "local": 
        model = _get_local_embedding_model() 
        embedding = model.encode( text, normalize_embeddings=True, ) 
        return embedding.tolist()  
    raise ValueError( f"EMBEDDING_PROVIDER không hợp lệ: " f"{EMBEDDING_PROVIDER}. " f"Chỉ hỗ trợ 'gemini' hoặc 'local'." )


def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """Cosine similarity giữa 2 vector."""
    denom = float(np.linalg.norm(v1) * np.linalg.norm(v2))
    if denom == 0:
        return 0.0
    return float(np.dot(v1, v2) / denom)


def _score_tools_from_rows(
    query_vector: np.ndarray,
    rows: Sequence[AIToolRegistryModel],
) -> list[tuple[str, float]]:
    '''
    Input:
    - query_vector=list: [0.8, 0.1, 0.7, 0.2]
    - rows=object: [AIToolRegistryModel, ...]
    Output:
    [
        ("weather", 0.98),
        ("search_web", 0.91),
        ("calculator", 0.25)
    ]
    '''
    scored: list[tuple[str, float]] = []
    for row in rows:
        if not row.embedding:
            continue
        tool_vec = np.array(row.embedding, dtype=float)
        score = cosine_similarity(query_vector, tool_vec)
        scored.append((row.name, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored


def _pick_tools(
    scored: list[tuple[str, float]],
    top_k: int,
    threshold: float,
) -> list[BaseTool]:
    '''
    Output:
    [
        ("weather", 0.98),
        ("search_web", 0.91)
    ]
    '''
    selected: list[BaseTool] = []
    for name, score in scored[:top_k]:
        if score < threshold:
            continue
        tool = TOOL_BY_NAME.get(name)
        if tool is None:
            logger.warning("[ToolRAG] Tool '%s' có trong DB nhưng không còn trong registry.", name,)
            continue
        selected.append(tool)
        logger.debug("[ToolRAG] Chọn tool=%s score=%.4f", name, score,)

    return selected


async def retrieve_tools(
    db: AsyncSession,
    user_query: str,
    top_k: int = DEFAULT_TOOL_TOP_K,
    threshold: float = DEFAULT_RAG_SCORE_THRESHOLD,
) -> list[BaseTool]:
    """RAG async — dùng trong LangGraph node Retriever."""
    # 1. embedding text -> array([1,2,3, ...])
    query_vector = np.array(embed_text(user_query, task_type="RETRIEVAL_QUERY"))

    # 2. lấy ra tất cả embedding trong db
    result = await db.execute(select(AIToolRegistryModel))
    rows = result.scalars().all()

    # 3. tính điểm tương đồng của embedding
    scored = _score_tools_from_rows(query_vector, rows)
    logger.info("[ToolRAG] Scores (name, score): %s", scored)

    return _pick_tools(scored, top_k, threshold)

async def main(): 
    async with SessionLocal() as db:
        data = await retrieve_tools(
            db,
            user_query="tôi muốn xem thông tin tài khoản cá nhân của tôi",
            top_k=5
        )
        logger.info(data)

if __name__ == "__main__":
    asyncio.run(main())