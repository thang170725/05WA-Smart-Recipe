"""
Structured output schemas cho các node Agent (Pydantic, ngắn — phù hợp model local 14B).
"""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class IntakeResult(BaseModel):
    """
    Node 1: Ép LLM trả về kết quả phân tích yêu cầu của người dùng theo một dạng JSON chuẩn xác.
        giúp hệ thống biết chính xác bước tiếp theo nên làm gì
    """

    intent: Literal["task", "general_qa", "out_of_scope", "unclear"] # phân loại ý định cốt lõi của người dùng vào đúng 1 trong 4 nhóm
    # task: Yêu cầu thực thi một hành động can thiệp dữ liệu hoặc cần workflow phức tạp (ví dụ: "lưu cân nặng hôm nay 65kg", "lên thực đơn 7 ngày").
    # general_qa: Câu hỏi kiến thức chung, tư vấn dinh dưỡng cơ bản không cần gọi tool ghi dữ liệu (ví dụ: "1 quả trứng gà bao nhiêu calo?").
    # out_of_scope: Câu hỏi lạc đề, nằm ngoài phạm vi chức năng của hệ thống (ví dụ: hỏi về sửa xe, chính trị, code web).
    # unclear: Câu hỏi quá mơ hồ, thiếu dữ kiện quan trọng để xử lý (ví dụ: chỉ gõ mỗi chữ "tôi muốn ăn").

    user_query: str
    rewritten_query: Optional[str] # câu truy vấn khi đã được AI viết lại
    current_query: str # câu ban đầu của người dùng
    clarify_question: Optional[str] = None # câu hỏi làm rõ gửi ngược lại cho người dùng nếu câu của người dùng chuaw rõ ý
    clarify_options: list[str] = Field(default_factory=list) # AI đưa ra các gợi ý nhanh
    flag_rewritten: Optional[int] = 0 # cờ đánh dấu có bật AI viết lại câu đó hay không



class Task(BaseModel):
    """Một task trong Plan (Phase 5)."""

    id: str
    domain: Literal["profile", "nutrition", "workout"]
    kind: Literal["read", "write", "export"]
    goal: str
    depends_on: list[str] = Field(default_factory=list)


class Plan(BaseModel):
    tasks: list[Task] = Field(default_factory=list)


class VerifyResult(BaseModel):
    """Node 6 Verifier (Phase 5)."""

    verdict: Literal["done", "more_tool", "need_info", "replan", "limit"]
    reason: str
    question: Optional[str] = None
    options: list[str] = Field(default_factory=list)


class StagedAction(BaseModel):
    """Thao tác ghi/xuất đã prepare, chờ Confirm Gate (Phase 3)."""

    id: str
    task_id: str
    tool: str
    args: dict[str, Any] = Field(default_factory=dict)
    preview: str
    risk: Literal["low", "high"] = "low"
    affected_count: int = 0
    idempotency_key: str = ""
