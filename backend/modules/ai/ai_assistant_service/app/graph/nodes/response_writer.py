"""
Node 10: RESPONDER (agent_return_result — giữ tên node cũ cho SSE tương thích).

Viết câu trả lời cuối; stream tiến độ qua workflow events ở service layer.
"""

from __future__ import annotations

import json
import logging

from backend.config.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    build_response_writer_prompt,
)
from backend.modules.ai.ai_assistant_service.app.utils.helpers import extract_text_from_response
from backend.modules.ai.ai_assistant_service.app.utils import trace


def _summarize_docs(docs: list) -> str:
    if not docs:
        return "(kho docs trống — trả lời bằng kiến thức model)"
    lines = []
    for d in docs[:5]:
        title = d.get("title") or d.get("id") or "doc"
        content = str(d.get("content") or "")[:400]
        lines.append(f"- {title}: {content}")
    return "\n".join(lines)


def _map_category(state: AgentState) -> tuple[str, str]:
    """Map intent / validation cũ → category cho prompt."""
    intent = (state.get("intent") or "").strip().lower()
    dv = state.get("decision_validation") or {}
    rv = state.get("result_validation") or {}
    tool_results = state.get("tool_results") or []

    if intent == "out_of_scope":
        return "OUTSIDE", state.get("clarify_question") or ""
    if intent == "unclear":
        return "UNKNOWN", state.get("clarify_question") or ""
    if intent == "general_qa":
        return "ASKANDANSWER", ""
    if tool_results:
        return "DATA_COMPLETE", rv.get("feedback") or ""

    category = dv.get("category") or "ASKANDANSWER"
    feedback = dv.get("feedback") or rv.get("feedback") or ""
    return str(category), str(feedback or "")


async def response_writer_node(state: AgentState, config: RunnableConfig) -> dict:
    if state.get("final_status") == "WAIT_CONFIRM":
        trace.banner("NODE 10 · RESPONDER", status="WAIT_CONFIRM")
        return {"progress": "Chờ xác nhận từ người dùng..."}

    if state.get("final_status") == "ERROR" and state.get("final_message"):
        trace.banner("NODE 10 · RESPONDER", status="ERROR")
        return {"progress": "Hoàn tất với thông báo lỗi."}

    user_query = state.get("rewritten_query") or state.get("user_query") or ""
    intent = (state.get("intent") or "").strip().lower()
    tool_results = state.get("tool_results") or []
    docs = state.get("docs") or []
    clarify_question = state.get("clarify_question") or ""
    clarify_options = list(state.get("clarify_options") or [])

    category, feedback = _map_category(state)

    trace.banner(
        "NODE 10 · RESPONDER",
        intent=intent or "-",
        category=category,
        n_tools=len(tool_results),
        n_docs=len(docs),
    )

    if tool_results:
        results_lines = []
        for r in tool_results:
            name = r.get("name", "tool")
            res = json.dumps(r.get("result"), ensure_ascii=False, default=str)
            if len(res) > 500:
                res = res[:500] + "..."
            results_lines.append(f"- {name}: {res}")
        tool_results_summary = "\n".join(results_lines)
    else:
        tool_results_summary = "(không có dữ liệu công cụ)"

    messages = state.get("messages") or []
    msg_lines = []
    for m in messages[-6:]:
        m_type = getattr(m, "type", "msg")
        m_content = getattr(m, "content", "")
        if isinstance(m_content, str):
            preview = m_content[:300] if len(m_content) > 300 else m_content
            msg_lines.append(f"{m_type}: {preview}")
    messages_summary = "\n".join(msg_lines) if msg_lines else "(không có)"

    # Unclear: ưu tiên câu hỏi có sẵn nếu LLM chậm / lỗi
    if intent == "unclear" and clarify_question:
        options_block = ""
        if clarify_options:
            options_block = "\n" + "\n".join(f"- {o}" for o in clarify_options)
        fallback_ask = f"{clarify_question}{options_block}".strip()
    else:
        fallback_ask = ""

    prompt = build_response_writer_prompt(
        user_query=user_query,
        category=category,
        feedback=feedback,
        tool_results_summary=tool_results_summary,
        messages_summary=messages_summary,
        intent=intent,
        docs_summary=_summarize_docs(docs),
        clarify_question=clarify_question,
        clarify_options=clarify_options,
    )

    llm = config["configurable"]["llm"]
    final_text = ""

    try:
        trace.step("Đang gọi LLM viết câu trả lời cuối...")
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        final_text = extract_text_from_response(response)
    except Exception as exc:
        logger.exception("[Node:Responder] LLM lỗi: %s", exc)
        trace.error("Responder lỗi: %s", exc)
        final_text = (
            fallback_ask
            or "Xin lỗi, hiện tại tôi chưa thể hoàn thiện câu trả lời. Bạn vui lòng thử lại nhé!"
        )

    if not final_text.strip():
        final_text = (
            fallback_ask
            or "Xin lỗi, tôi chưa tìm thấy thông tin phù hợp cho yêu cầu này."
        )

    # Phase 1: unclear vẫn trả text (Phase 4 mới interrupt + quick reply SSE)
    status = "SUCCESS"
    if intent == "unclear":
        status = "ASK_USER"

    trace.step("Responder xong (%d ký tự) status=%s", len(final_text), status)

    return {
        "messages": [AIMessage(content=final_text)],
        "final_status": status,
        "final_message": final_text,
        "final_answer": final_text,
        "progress": "Đã hoàn thành câu trả lời.",
    }
