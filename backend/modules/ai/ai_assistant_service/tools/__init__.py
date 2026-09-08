"""
Public exports của package tools.

Giữ tương thích import cũ ở mức tối thiểu; logic chính nằm ở registry + rag.
"""

from backend.modules.ai.ai_assistant_service.tools.registry import (
    ALL_TOOLS,
    TOOL_BY_NAME,
    TOOL_EXECUTORS,
    WRITE_TOOL_NAMES,
    is_write_tool,
    summarize_tools,
)
from backend.modules.ai.ai_assistant_service.tools.rag import (
    retrieve_tools,
    embed_text,
)

__all__ = [
    "ALL_TOOLS",
    "TOOL_BY_NAME",
    "TOOL_EXECUTORS",
    "WRITE_TOOL_NAMES",
    "is_write_tool",
    "summarize_tools",
    "retrieve_tools",
    "embed_text",
]
