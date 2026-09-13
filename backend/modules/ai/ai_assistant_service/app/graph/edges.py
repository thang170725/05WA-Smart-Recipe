"""
Conditional edges — routing theo kiến trúc Multi-Agent LangGraph Pipeline.

Routing flow:
  1. agent_choose_branch (Router Agent)
     ├─ TOOL    → execute_tool
     └─ NO_TOOL → eval_no_tool

  2. eval_tool (Result Evaluator)
     ├─ DATA_COMPLETE       → agent_return_result
     ├─ NEED_MORE_TOOLS     → agent_choose_branch (hoặc agent_return_result nếu đạt limit)
     └─ FAILED              → rewrite (hoặc agent_return_result nếu hết lượt retry)

  3. eval_no_tool (No-Tool Evaluator)
     ├─ Valid (YES)         → agent_return_result
     └─ Invalid (NO)        → rewrite (hoặc agent_return_result nếu hết lượt retry)
"""

from __future__ import annotations

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils import trace


def route_after_router_agent(state: AgentState) -> str:
    """
    Router Agent Edge:
      "TOOL"    → execute_tool
      "NO_TOOL" → eval_no_tool
    """
    decision = state.get("decision") or {}
    action = str(decision.get("action") or "").upper()

    if action == "TOOL":
        trace.log_route("agent_choose_branch", "TOOL", "execute_tool")
        return "execute_tool"

    trace.log_route("agent_choose_branch", "NO_TOOL", "eval_no_tool")
    return "eval_no_tool"


def route_after_tool_eval(state: AgentState) -> str:
    """
    Tool Evaluation Edge:
      "DATA_COMPLETE"   → agent_return_result
      "NEED_MORE_TOOLS" → agent_choose_branch (nếu còn lượt) hoặc agent_return_result (nếu hết lượt)
      "FAILED"          → rewrite (nếu còn lượt) hoặc agent_return_result (nếu hết lượt)
    """
    validation = state.get("result_validation") or {}
    status = str(validation.get("status") or "DATA_COMPLETE").upper()

    iteration = int(state.get("iteration") or 0)
    max_iterations = int(state.get("max_iterations") or 6)
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)
    execution_iteration = int(state.get("execution_iteration") or 0)
    max_execution = int(state.get("max_execution_steps") or 4)

    if status in {"DATA_COMPLETE", "SUCCESS"}:
        trace.log_route("eval_tool", "DATA_COMPLETE", "agent_return_result")
        return "agent_return_result"

    if status in {"NEED_MORE_TOOLS", "INSUFFICIENT"}:
        if iteration >= max_iterations or execution_iteration >= max_execution:
            trace.log_route("eval_tool", "NEED_MORE_TOOLS_exhausted", "agent_return_result")
            return "agent_return_result"
        trace.log_route("eval_tool", "NEED_MORE_TOOLS", "agent_choose_branch")
        return "agent_choose_branch"

    # FAILED / ERROR / WRONG_TOOL
    if retrieval_iteration >= max_retrieval or iteration >= max_iterations:
        trace.log_route("eval_tool", "FAILED_exhausted", "agent_return_result")
        return "agent_return_result"

    trace.log_route("eval_tool", "FAILED", "rewrite")
    return "rewrite"


def route_after_no_tool_eval(state: AgentState) -> str:
    """
    No-Tool Evaluation Edge:
      True  (Valid)   → agent_return_result
      False (Invalid) → rewrite (nếu còn lượt) hoặc agent_return_result (nếu hết lượt)
    """
    validation = state.get("decision_validation") or {}
    is_valid = validation.get("valid", True)
    category = str(validation.get("category") or "").upper()

    iteration = int(state.get("iteration") or 0)
    max_iterations = int(state.get("max_iterations") or 6)
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)

    # Nếu hợp lệ hoặc không phải INVALID_BYPASS
    if is_valid and category != "INVALID_BYPASS":
        trace.log_route("eval_no_tool", "VALID", "agent_return_result")
        return "agent_return_result"

    # Không hợp lệ (cần gọi tool mà bị bỏ qua)
    if retrieval_iteration >= max_retrieval or iteration >= max_iterations:
        trace.log_route("eval_no_tool", "INVALID_exhausted", "agent_return_result")
        return "agent_return_result"

    trace.log_route("eval_no_tool", "INVALID", "rewrite")
    return "rewrite"


# ---------------------------------------------------------------------------
# Backward-compatibility wrappers
# ---------------------------------------------------------------------------
def route_after_agent(state: AgentState) -> str:
    return route_after_router_agent(state)

def route_after_decision_validator(state: AgentState) -> str:
    return route_after_no_tool_eval(state)

def route_after_execute(state: AgentState) -> str:
    return "eval_tool"

def route_after_result_evaluator(state: AgentState) -> str:
    return route_after_tool_eval(state)
