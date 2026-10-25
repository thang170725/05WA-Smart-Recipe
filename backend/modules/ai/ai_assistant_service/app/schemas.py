"""
API schemas cho FastAPI routes của AI Assistant.
"""

from pydantic import BaseModel
from typing import Optional


class InputAiAssistantSchema(BaseModel):
    """Body POST /ai/chat."""

    prompt: Optional[str] = None


class ConfirmSchema(BaseModel):
    """Body POST /ai/confirm — backward-compat, xác nhận thao tác ghi đang treo."""

    action_id: str


class ResumeSchema(BaseModel):
    """
    Body POST /ai/resume — tiếp tục graph đang interrupt.
    
    reply: câu trả lời của user (chọn option hoặc gõ tự do).
           Với confirm_gate: "Xác nhận" hoặc "Hủy".
           Với ask_user: text tùy ý hoặc option đã chọn.
    """

    reply: str
