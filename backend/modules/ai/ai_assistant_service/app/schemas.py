"""
API schemas cho FastAPI routes của AI Assistant.

Đã loại bỏ Intent Layer1/Layer2 (Decision Tree cũ) — Agent tự suy luận.
"""

from pydantic import BaseModel
from typing import Optional


class InputAiAssistantSchema(BaseModel):
    """Body POST /ai/chat."""

    prompt: Optional[str] = None


class ConfirmSchema(BaseModel):
    """Body POST /ai/confirm — xác nhận thao tác ghi đang treo."""

    action_id: str
