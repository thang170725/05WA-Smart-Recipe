"""
Tool Registry — điểm đăng ký duy nhất cho toàn bộ Tools của hệ thống.

Khi thêm tool mới:
  1. Viết @tool + executor trong file domain (user_tools / food_tools / ...)
  2. Import và append vào ALL_TOOLS bên dưới
  3. Chạy sync_to_mysql.py để cập nhật embedding vào MariaDB
"""

from __future__ import annotations

from typing import Callable, Awaitable, Any

from langchain_core.tools import BaseTool

from backend.modules.ai.ai_assistant_service.tools.user_tools import (
    USER_TOOLS,
    USER_TOOL_EXECUTORS,
    USER_WRITE_TOOL_NAMES,
)

# ---------------------------------------------------------------------------
# Catalog toàn hệ thống
# ---------------------------------------------------------------------------
ALL_TOOLS: list[BaseTool] = [
    *USER_TOOLS,
    # *FOOD_TOOLS,   # mở rộng sau
    # *WORKOUT_TOOLS,
]

# name → BaseTool (để RAG map từ tên trong DB → object bind được)
TOOL_BY_NAME: dict[str, BaseTool] = {t.name: t for t in ALL_TOOLS}

# name → async executor(db, user_id, **args)
TOOL_EXECUTORS: dict[str, Callable[..., Awaitable[Any]]] = {
    **USER_TOOL_EXECUTORS,
}

# Tập tên tool ghi dữ liệu (cần WAIT_CONFIRM)
WRITE_TOOL_NAMES: set[str] = set(USER_WRITE_TOOL_NAMES)


def is_write_tool(tool_name: str) -> bool:
    """True nếu tool sẽ thay đổi dữ liệu trong DB."""
    return tool_name in WRITE_TOOL_NAMES


def summarize_tools(tools: list[BaseTool]) -> str:
    """Chuỗi mô tả ngắn cho Evaluator / logging."""
    if not tools:
        return "(không có tool nào được retrieve)"
    lines = []
    for t in tools:
        desc = (t.description or "").strip().replace("\n", " ")
        lines.append(f"- {t.name}: {desc[:180]}")
    return "\n".join(lines)
