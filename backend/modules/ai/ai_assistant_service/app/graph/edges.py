"""
Conditional edges — routing theo kiến trúc mới (description.md §30–33).

  agent → execute | validate_no_tool | rewrite
  decision_validator → end | rewrite
  result_evaluator → agent | rewrite
  execute → result_evaluator | end (WAIT_CONFIRM / ERROR)
"""

from __future__ import annotations

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils import trace


def route_after_agent(state: AgentState) -> str:
    """
    CALL_TOOL       → execute
    NEED_RETRIEVAL  → rewrite
    FINAL_ANSWER    → validate_no_tool
    """
    decision = state.get("decision") or {}
    action = str(decision.get("action") or "").upper()

    if action == "CALL_TOOL":
        trace.route("agent", "CALL_TOOL", "execute")
        return "execute"

    if action == "NEED_RETRIEVAL":
        retrieval_iteration = int(state.get("retrieval_iteration") or 0)
        max_retrieval = int(state.get("max_retrieval_retries") or 2)
        if retrieval_iteration >= max_retrieval:
            # Hết discovery → ép validate câu trả lời (nếu có) hoặc end
            trace.route("agent", "NEED_RETRIEVAL_exhausted", "validate_no_tool")
            return "validate_no_tool"
        trace.route("agent", "NEED_RETRIEVAL", "rewrite")
        return "rewrite"

    # FINAL_ANSWER / NO_TOOL / mặc định
    trace.route("agent", "FINAL_ANSWER", "validate_no_tool")
    return "validate_no_tool"


def route_after_decision_validator(state: AgentState) -> str:
    validation = state.get("decision_validation") or {}
    status = str(validation.get("status") or "VALID").upper()

    if status == "VALID":
        trace.route("decision_validator", "VALID", "END")
        return "end"

    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)
    if retrieval_iteration >= max_retrieval:
        trace.route("decision_validator", "INVALID_but_exhausted", "END")
        return "end"

    trace.route("decision_validator", "INVALID", "rewrite")
    return "rewrite"


def route_after_execute(state: AgentState) -> str:
    """
    WAIT_CONFIRM / ERROR → END
    còn lại → result_evaluator
    """
    status = state.get("final_status")
    if status in ("WAIT_CONFIRM", "ERROR"):
        trace.route("execute", status or "stop", "END")
        return "end"

    trace.route("execute", "tool_results_ready", "result_evaluator")
    return "result_evaluator"


def route_after_result_evaluator(state: AgentState) -> str:
    """
    WRONG_TOOL / should_retrieve_again → rewrite (nếu còn lượt)
    còn lại → agent (Agent tự quyết định bước tiếp)
    """
    validation = state.get("result_validation") or {}
    should_retrieve = bool(validation.get("should_retrieve_again"))
    category = str(validation.get("category") or "").upper()

    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)

    if should_retrieve or category == "WRONG_TOOL":
        if retrieval_iteration < max_retrieval:
            trace.route("result_evaluator", "WRONG_TOOL", "rewrite")
            return "rewrite"
        trace.route("result_evaluator", "WRONG_TOOL_exhausted", "agent")
        return "agent"

    status = str(validation.get("status") or "SUCCESS").upper()
    trace.route("result_evaluator", status, "agent")
    return "agent"
