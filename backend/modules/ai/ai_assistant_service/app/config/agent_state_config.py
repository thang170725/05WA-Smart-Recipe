"""
AgentState — bộ nhớ dùng chung xuyên suốt LangGraph.

Flow mới (agent_requirements.md):
  Intake → (Docs | Planner/Specialist bridge | Ask | Responder)

Giữ field cũ (retrieved_tools, decision, …) để nhánh task còn bridge
qua retrieve → router → execute cho đến Phase 2–5.
"""

from __future__ import annotations

from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    # ---- Định danh (backend gán; LLM không ghi) ----
    user_id: int
    thread_id: str

    # ---- Hội thoại ----
    messages: Annotated[list[AnyMessage], add_messages]
    user_query: str
    rewritten_query: str
    intent: str  # task | general_qa | out_of_scope | unclear
    clarify_question: Optional[str]
    clarify_options: List[str]

    # ---- Docs (Node 2; được phép rỗng) ----
    docs: List[Dict[str, Any]]

    # ---- Plan / task (Phase 5; stub Phase 1) ----
    plan: List[Dict[str, Any]]
    task_status: Dict[str, str]
    task_results: Dict[str, Any]
    staged_actions: List[Dict[str, Any]]
    approved_action_ids: List[str]
    step_count: Dict[str, int]
    replan_count: int
    ask_count: int
    files: List[Dict[str, Any]]

    # ---- Bridge: tool RAG / router cũ (Phase 1–2) ----
    current_query: str
    query_history: List[str]
    retrieved_tools: List[Any]
    active_tools: List[Any]
    retrieval_history: List[Dict[str, Any]]
    decision: Optional[Dict[str, Any]]
    decision_validation: Optional[Dict[str, Any]]
    tool_calls: List[Dict[str, Any]]
    tool_results: List[Dict[str, Any]]
    used_tools: List[str]
    result_validation: Optional[Dict[str, Any]]
    iteration: int
    retrieval_iteration: int
    execution_iteration: int
    max_iterations: int
    max_retrieval_retries: int
    max_execution_steps: int

    # ---- Runtime (không serialize) ----
    db: Any
    current_user: Any
    llm: Any

    # ---- Output / progress ----
    progress: Optional[str]
    final_status: Optional[str]  # SUCCESS | WAIT_CONFIRM | ERROR | ASK_USER
    final_message: Optional[str]
    final_answer: Optional[str]
    action_id: Optional[str]
