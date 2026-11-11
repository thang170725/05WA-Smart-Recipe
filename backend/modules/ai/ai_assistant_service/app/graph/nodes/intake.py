"""
Node 1: INTAKE

Nạp ngữ cảnh gần nhất → rewrite chỉ khi phụ thuộc ngữ cảnh → phân loại intent.
"""

from __future__ import annotations

import logging

from backend.config.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig

from backend.modules.ai.ai_assistant_service.app.agent_schemas import IntakeResult
from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.design_decisions import (
    CHAT_HISTORY_WINDOW,
    MAX_STRUCTURED_PARSE_RETRIES,
)
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import build_intake_prompt_rule
from backend.modules.ai.ai_assistant_service.app.utils.helpers import (
    extract_text_from_response,
    safe_json_loads,
)
from backend.modules.ai.ai_assistant_service.app.utils import trace

_VALID_INTENTS = {"task", "general_qa", "out_of_scope", "unclear"}


def _summarize_recent_messages(messages: list, window: int) -> str:
    """Tóm tắt N tin gần nhất (bỏ tin Human vừa gửi nếu trùng user_query)."""
    if not messages:
        return "(chưa có lịch sử)"

    lines: list[str] = []
    for m in list(messages)[-window:]:
        role = getattr(m, "type", "msg")
        content = getattr(m, "content", "")
        if not isinstance(content, str):
            content = str(content)
        preview = content.strip()
        if len(preview) > 240:
            preview = preview[:240] + "..."
        if preview:
            lines.append(f"{role}: {preview}")
    return "\n".join(lines) if lines else "(chưa có lịch sử)"


def _parse_intake(raw: str) -> IntakeResult | None:
    data = safe_json_loads(raw)

    if not isinstance(data, dict):
        return None
    intent = str(data.get("intent") or "").strip().lower()

    if intent not in _VALID_INTENTS:
        return None
    rewritten = str(data.get("rewritten_query") or "").strip()

    if not rewritten:
        return None
    options = data.get("clarify_options") or []

    if not isinstance(options, list):
        options = []
    options = [str(o).strip() for o in options if str(o).strip()][:4]

    clarify = data.get("clarify_question")
    clarify_q = str(clarify).strip() if clarify else None

    return IntakeResult(
        intent=intent,  # type: ignore[arg-type]
        rewritten_query=rewritten,
        clarify_question=clarify_q,
        clarify_options=options,
    )


async def intake_node(state: AgentState, config: RunnableConfig, flag_rewritten: int = 0) -> dict:
    """
    Phân loại ý định + rewrite có điều kiện.
    Parse lỗi 2 lần → intent=unclear.
    """
    user_query = (state.get("user_query") or "").strip()
    messages = state.get("messages") or []
    history = _summarize_recent_messages(messages, CHAT_HISTORY_WINDOW)
    has_history = history != "(chưa có lịch sử)"
    trace.banner("NODE 1 · INTAKE", user_query=user_query, messages=messages, history=history)

    prompt = build_intake_prompt_rule(user_query=user_query, chat_history=history, has_history=has_history)
    llm = config["configurable"]["llm"]
    structured_llm = llm.with_structured_output(IntakeResult)
    result: IntakeResult | None = None

    for attempt in range(1, MAX_STRUCTURED_PARSE_RETRIES + 1):
        try:
            trace.step("Intake LLM attempt %d/%d", attempt, MAX_STRUCTURED_PARSE_RETRIES)
            result = await structured_llm.ainvoke([HumanMessage(content=prompt)])
            logger.debug("Intake result:\n%s", result.model_dump())
            break
        except Exception:
            logger.exception("[Node:Intake] LLM lỗi attempt %d", attempt)
            trace.warn("Intake LLM lỗi attempt %d", attempt)

    if not result:
        result = IntakeResult(
            intent="unclear",
            clarify_question="Bạn muốn mình hỗ trợ việc gì liên quan đến dinh dưỡng, nhật ký ăn uống, luyện tập hay hồ sơ cá nhân?",
            clarify_options=[
                "Xem / cập nhật hồ sơ",
                "Nhật ký ăn uống",
                "Nhật ký tập luyện",
                "Hỏi kiến thức dinh dưỡng",
            ],
        )
        trace.warn("Intake fallback → unclear")
        
    rewritten = (result.rewritten_query or "").strip()
    if not has_history or rewritten.lower() == user_query.lower():
        rewritten = ""                         
    current_query = rewritten or user_query    # code tự tính, không bắt LLM chép

    # Đồng bộ bridge field cho nhánh task cũ
    out = {
        "intent": result.intent,
        "user_query": user_query,
        "rewritten_query": result.rewritten_query,
        "current_query": current_query,
        "query_history": [current_query],
        "clarify_question": result.clarify_question,
        "clarify_options": result.clarify_options,
        "retrieval_iteration": 0,
        "progress": f"Đã hiểu ý định: {result.intent}",
        "final_status": None,
        "final_message": None,
        "final_answer": None,
    }
    logger.info("Result Node 1:\n%s", out)
    return out
