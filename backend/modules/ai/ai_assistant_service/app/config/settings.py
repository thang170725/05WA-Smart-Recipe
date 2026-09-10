"""
Cấu hình LLM và hằng số runtime cho AI Assistant Agent.

Hỗ trợ 2 backend:
  - option="local" → ChatOllama (Qwen / mô hình local có function calling)  [mặc định]
  - option="key"   → ChatGoogleGenerativeAI (Gemini)

Ưu tiên local (qwen2.5:7b + AITeamVN/Vietnamese_Embedding_v2) để tiết kiệm chi phí.
Lưu ý VRAM: embedding local nên chạy CPU (EMBEDDING_DEVICE=cpu) để Ollama giữ GPU.
"""

import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# Số tool tối đa lấy từ Vector DB mỗi lượt hỏi
DEFAULT_TOOL_TOP_K = int(float(os.getenv("DEFAULT_TOOL_TOP_K", "5")))

# Ngưỡng cosine similarity tối thiểu để giữ tool (0–1)
DEFAULT_RAG_SCORE_THRESHOLD = float(os.getenv("DEFAULT_RAG_SCORE_THRESHOLD", "0.45"))

# ---- Loop limits (description.md §24–25) ----
DEFAULT_MAX_ITERATIONS = int(os.getenv("DEFAULT_MAX_ITERATIONS", "6"))
DEFAULT_MAX_RETRIEVAL_RETRIES = int(os.getenv("DEFAULT_MAX_RETRIEVAL_RETRIES", "2"))
DEFAULT_MAX_EXECUTION_STEPS = int(os.getenv("DEFAULT_MAX_EXECUTION_STEPS", "4"))

# Backend LLM mặc định
DEFAULT_LLM_OPTION = os.getenv("LLM_OPTION", "local").lower()
DEFAULT_LOCAL_MODEL = os.getenv("LOCAL_LLM_MODEL", "qwen2.5:7b")

# Ollama tuning — num_ctx thấp hơn = ít VRAM hơn (GPU 4GB dễ OOM với 4096)
OLLAMA_NUM_CTX = int(os.getenv("OLLAMA_NUM_CTX", "2048"))
OLLAMA_NUM_PREDICT = int(os.getenv("OLLAMA_NUM_PREDICT", "512"))
OLLAMA_NUM_THREAD = int(os.getenv("OLLAMA_NUM_THREAD", "4"))
OLLAMA_REQUEST_TIMEOUT = int(os.getenv("OLLAMA_REQUEST_TIMEOUT", "120"))

# Khi Ollama crash/OOM → tự chuyển Gemini nếu có GOOGLE_API_KEY
LLM_AUTO_FALLBACK = os.getenv("LLM_AUTO_FALLBACK", "true").lower() in {
    "1",
    "true",
    "yes",
    "on",
}


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
            request_timeout=OLLAMA_REQUEST_TIMEOUT,
            num_ctx=OLLAMA_NUM_CTX,
            num_predict=OLLAMA_NUM_PREDICT,
            num_thread=OLLAMA_NUM_THREAD,
            keep_alive="5m",
        )

    api_key = os.getenv("GOOGLE_API_KEY", default=None)
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is missing — không thể khởi tạo Gemini.")

    return ChatGoogleGenerativeAI(
        model=os.getenv("GEMINI_MODEL", "models/gemini-2.0-flash"),
        google_api_key=api_key,
        temperature=temperature,
        request_timeout=60,
    )


def format_llm_error(exc: BaseException) -> str:
    """Đổi exception Ollama/Gemini thành thông báo tiếng Việt cho user."""
    msg = str(exc).lower()

    if (
        "llama runner" in msg
        or "out of memory" in msg
        or "cuda" in msg
        or "status code: 500" in msg
    ):
        return (
            "Model local (Ollama) bị dừng giữa chừng — thường do hết VRAM/RAM "
            "(qwen2.5:7b cần GPU trống; embedding đã được ép chạy CPU). "
            "Hãy thử lại lần nữa, hoặc đặt LLM_OPTION=key trong .env để dùng Gemini."
        )

    if (
        "connect" in msg
        or "connection" in msg
        or "refused" in msg
        or "not responding" in msg
    ):
        return (
            "Không kết nối được Ollama. "
            "Chạy lệnh: ollama serve  rồi thử lại "
            "(hoặc đặt LLM_OPTION=key để dùng Gemini)."
        )

    return "AI hiện đang quá tải, vui lòng thử lại sau."


def can_fallback_to_gemini(current_option: str) -> bool:
    """True nếu đang local, bật auto-fallback, và có GOOGLE_API_KEY."""
    if current_option != "local":
        return False
    if not LLM_AUTO_FALLBACK:
        return False
    return bool(os.getenv("GOOGLE_API_KEY"))
