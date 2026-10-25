"""
Conditional edges — Phase 2/3/4 update.

Thêm:
  - route_after_execute: READ → eval_tool | WRITE → confirm_gate
  - route_after_confirm_gate: SUCCESS/ERROR → agent_return_result
  - route_after_intake: unclear → ask_user (interrupt) thay vì agent_return_result
"""

from __future__ import annotations

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.utils import trace


def route_after_intake(state: AgentState) -> str:
    """
    Intake:
      general_qa   → docs_retrieval
      out_of_scope → agent_return_result
      unclear      → ask_user (Phase 4 interrupt)
      task         → retrieve (bridge tool path)
    """
    intent = str(state.get("intent") or "").strip().lower()

    if intent == "general_qa":
        trace.log_route("intake", "general_qa", "docs_retrieval")
        return "docs_retrieval"
    if intent == "out_of_scope":
        trace.log_route("intake", "out_of_scope", "agent_return_result")
        return "agent_return_result"
    if intent == "unclear":
        trace.log_route("intake", "unclear", "ask_user")
        return "ask_user"

    # task (mặc định an toàn: nếu intent lạ cũng đi bridge retrieve)
    trace.log_route("intake", intent or "task", "retrieve")
    return "retrieve"


def route_after_router_agent(state: AgentState) -> str:
    """
    Router Agent Edge:
      "TOOL"    → execute_tool
      "NO_TOOL" → eval_no_tool
      "NEED_INFO" → ask_user (Phase 4: router biết cần hỏi thêm)
    """
    decision = state.get("decision") or {}
    action = str(decision.get("action") or "").upper()

    if action == "TOOL":
        trace.log_route("agent_choose_branch", "TOOL", "execute_tool")
        return "execute_tool"

    if action == "NEED_INFO":
        trace.log_route("agent_choose_branch", "NEED_INFO", "ask_user")
        return "ask_user"

    trace.log_route("agent_choose_branch", "NO_TOOL", "eval_no_tool")
    return "eval_no_tool"


def route_after_execute(state: AgentState) -> str:
    """
    Execute Edge (Phase 3):
      NEED_CONFIRM → confirm_gate (interrupt)
      default      → eval_tool
    """
    final_status = str(state.get("final_status") or "").upper()
    if final_status == "NEED_CONFIRM":
        trace.log_route("execute_tool", "NEED_CONFIRM", "confirm_gate")
        return "confirm_gate"
    trace.log_route("execute_tool", "READ_DONE", "eval_tool")
    return "eval_tool"


def route_after_confirm_gate(state: AgentState) -> str:
    """
    Confirm Gate Edge:
      Luôn → agent_return_result (final_message đã set trong confirm_gate)
    """
    trace.log_route("confirm_gate", "done", "agent_return_result")
    return "agent_return_result"


def route_after_ask_user(state: AgentState) -> str:
    """
    Ask User Edge (sau interrupt resume):
      - Nếu ask_count vượt MAX → agent_return_result (answer clarify_question)
      - Ngược lại → retrieve (xử lý lại query mới từ user)
    """
    from backend.modules.ai.ai_assistant_service.app.config.design_decisions import MAX_ASK
    ask_count = int(state.get("ask_count") or 0)
    final_status = str(state.get("final_status") or "").upper()

    if final_status == "ASK_USER":
        # Đã hết MAX_ASK, trả thẳng
        trace.log_route("ask_user", "ASK_USER_limit", "agent_return_result")
        return "agent_return_result"

    # Resume từ interrupt với query mới → xử lý từ đầu pipeline task
    trace.log_route("ask_user", "resume", "retrieve")
    return "retrieve"


def route_after_tool_eval(state: AgentState) -> str:
    """
    Tool Evaluation Edge:
      "DATA_COMPLETE"   → agent_return_result
      "NEED_MORE_TOOLS" → agent_choose_branch (nếu còn lượt) hoặc agent_return_result
      "FAILED"          → rewrite (nếu còn lượt) hoặc agent_return_result
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
      UNKNOWN → ask_user (Phase 4)
      True  (Valid)   → agent_return_result
      False (Invalid) → rewrite (nếu còn lượt) hoặc agent_return_result
    """
    validation = state.get("decision_validation") or {}
    is_valid = validation.get("valid", True)
    category = str(validation.get("category") or "").upper()

    iteration = int(state.get("iteration") or 0)
    max_iterations = int(state.get("max_iterations") or 6)
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)
    ask_count = int(state.get("ask_count") or 0)
    from backend.modules.ai.ai_assistant_service.app.config.design_decisions import MAX_ASK

    # UNKNOWN → hỏi user (nếu còn quota hỏi)
    if category == "UNKNOWN" and ask_count < MAX_ASK:
        trace.log_route("eval_no_tool", "UNKNOWN", "ask_user")
        return "ask_user"

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

def route_after_result_evaluator(state: AgentState) -> str:
    return route_after_tool_eval(state)
