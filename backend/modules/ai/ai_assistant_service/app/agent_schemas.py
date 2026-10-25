"""
Structured output schemas cho các node Agent (Pydantic, ngắn — phù hợp model local 14B).
"""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class IntakeResult(BaseModel):
    """Node 1 Intake — phân loại ý định + rewrite khi cần."""

    intent: Literal["task", "general_qa", "out_of_scope", "unclear"]
    rewritten_query: str
    clarify_question: Optional[str] = None
    clarify_options: list[str] = Field(default_factory=list)


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
