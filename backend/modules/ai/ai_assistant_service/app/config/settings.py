"""
Cấu hình LLM và hằng số runtime cho AI Assistant Agent.

Hỗ trợ 2 backend:
  - option="local" → ChatOllama (Qwen / mô hình local có function calling)  [mặc định]
  - option="key"   → ChatGoogleGenerativeAI (Gemini)

Ưu tiên local (qwen2.5:7b + AITeamVN/Vietnamese_Embedding_v2) để tiết kiệm chi phí.
"""

import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# Số tool tối đa lấy từ Vector DB mỗi lượt hỏi
DEFAULT_TOOL_TOP_K = 5

# Ngưỡng cosine similarity tối thiểu để giữ tool (0–1)
DEFAULT_RAG_SCORE_THRESHOLD = 0.55

# ---- Loop limits (description.md §24–25) ----
DEFAULT_MAX_ITERATIONS = 6          # tổng vòng Agent
DEFAULT_MAX_RETRIEVAL_RETRIES = 2    # discovery loop (rewrite → retrieve)
DEFAULT_MAX_EXECUTION_STEPS = 4     # số lần execute tool

# Backend LLM mặc định
DEFAULT_LLM_OPTION = os.getenv("LLM_OPTION", "local").lower()
DEFAULT_LOCAL_MODEL = os.getenv("LOCAL_LLM_MODEL", "qwen2.5:7b")


def get_llm(
    option: str = DEFAULT_LLM_OPTION,
    name_local: str = DEFAULT_LOCAL_MODEL,
    temperature: float = 0.3,
):
    """
    Factory tạo Chat Model dùng cho Agent / Validator / Evaluator / Rewriter.

    temperature thấp (≈0.2–0.3) giúp function calling ổn định hơn.
    """
    if option == "local":
        return ChatOllama(
            model=name_local,
            temperature=temperature,
            request_timeout=60,
            num_ctx=4096,
            num_thread=4,
            keep_alive="5m",
        )

    api_key = os.getenv("GOOGLE_API_KEY", default=None)
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is missing — không thể khởi tạo Gemini.")

    return ChatGoogleGenerativeAI(
        model="models/gemini-3.5-flash",
        google_api_key=api_key,
        temperature=temperature,
        request_timeout=60,
    )
