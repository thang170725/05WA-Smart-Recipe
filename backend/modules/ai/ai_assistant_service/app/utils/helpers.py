"""
Helpers dùng chung cho các node trong graph (không chứa business logic).
"""

from __future__ import annotations

import json
import re
from typing import Any


def extract_text_from_response(response: Any) -> str:
    """
    Bóc text an toàn từ response LLM.

    Tương thích:
      - Ollama / đa số provider: content = str
      - Gemini: content có thể là list[{text: ...}] hoặc parts
    
    Output=str: khi AI trả fuwx liệu nó sẽ có nhiều định dạng, hàm này sẽ cố format lại thành str
    """
    if response is None:
        return ""

    if hasattr(response, "text") and response.text:
        return str(response.text).strip()

    content = getattr(response, "content", response)

    if isinstance(content, str):
        return content.strip()

    if isinstance(content, list):
        parts: list[str] = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                parts.append(str(part["text"]))
            elif hasattr(part, "text"):
                parts.append(str(part.text))
        return "".join(parts).strip()

    return str(content).strip()


def safe_json_loads(text: str) -> dict | None:
    """
    Parse JSON từ output LLM; chịu được markdown fence ```json ... ```.
    Trả về None nếu không parse được.

    Nhận một chuỗi text từ LLM và cố gắng lấy JSON object (dict) ra khỏi đó một cách an toàn.

    Input
        + text=str:
    """
    if not text:
        return None

    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned, re.IGNORECASE)
    if fence:
        cleaned = fence.group(1).strip()

    try:
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if not match:
            return None
        try:
            data = json.loads(match.group(0))
            return data if isinstance(data, dict) else None
        except json.JSONDecodeError:
            return None


def serialize_tool_result(result: Any) -> str:
    """Chuẩn hóa kết quả tool thành chuỗi đưa vào ToolMessage."""
    if isinstance(result, str):
        return result
    try:
        return json.dumps(result, ensure_ascii=False, default=str)
    except TypeError:
        return str(result)


def get_original_user_question(messages: list) -> str:
    """
    Lấy câu hỏi gốc của user (HumanMessage đầu tiên).
    Ưu tiên state['user_query'] ở các node — helper này là fallback.
    """
    for msg in messages:
        msg_type = getattr(msg, "type", None)
        if msg_type == "human":
            content = getattr(msg, "content", "")
            if isinstance(content, str) and content.strip():
                return content.strip()
    if messages:
        return extract_text_from_response(messages[-1])
    return ""


def summarize_retrieval_history(history: list[dict] | None) -> str:
    """Tóm tắt retrieval_history cho Query Rewriter."""
    if not history:
        return "(chưa có)"
    lines = []
    for item in history:
        query = item.get("query", "?")
        tools = item.get("tools") or []
        lines.append(f"- query={query!r} → tools={tools}")
    return "\n".join(lines)


def parse_need_retrieval(text: str) -> dict | None:
    """Nhận diện action NEED_RETRIEVAL từ text Agent."""
    data = safe_json_loads(text)
    if not data:
        return None
    action = str(data.get("action") or "").upper()
    if action in {"NEED_RETRIEVAL", "NEED_TOOL", "REQUEST_NEW_TOOL", "NEED_TOOL_DISCOVERY"}:
        return {
            "action": "NEED_RETRIEVAL",
            "reason": str(data.get("reason") or "").strip(),
        }
    return None


# Từ khóa gợi ý cần evidence bên ngoài / dữ liệu user (deterministic)
REALTIME_OR_PERSONAL_KEYWORDS = (
    # realtime / current
    "hiện tại", "hôm nay", "bây giờ", "mới nhất", "realtime", "real-time",
    "current", "today", "latest", "now",
    # personal / DB
    "của tôi", "của mình", "hồ sơ", "tài khoản", "email của",
    "bmi", "bmr", "tdee", "cân nặng", "chiều cao", "địa chỉ",
    "cập nhật", "sửa", "đổi", "thay đổi",
    "profile", "my email", "my info", "my profile",
)


def heuristic_needs_external_evidence(user_query: str) -> tuple[bool, str]:
    """
    Deterministic check: query có dấu hiệu cần tool / evidence ngoài model knowledge?
    Trả về (needs_evidence, hint_text).
    """
    q = (user_query or "").lower()
    hits = [kw for kw in REALTIME_OR_PERSONAL_KEYWORDS if kw in q]
    if hits:
        return True, f"Query chứa tín hiệu cần evidence/tool: {hits}"
    return False, "Không thấy từ khóa realtime/cá nhân rõ ràng."
