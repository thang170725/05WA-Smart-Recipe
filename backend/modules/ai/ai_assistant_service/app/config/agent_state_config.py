"""
AgentState — bộ nhớ dùng chung xuyên suốt vòng lặp LangGraph.

Kiến trúc mới (description.md):
  Loop A — Discovery:  rewrite → retrieve → agent → decision_validator
  Loop B — Execution:  agent → execute → result_evaluator → agent

Mỗi node đọc/ghi partial dict; LangGraph merge vào state tổng.
`messages` dùng reducer `add_messages` để append (không ghi đè) lịch sử hội thoại.
"""

from typing import Annotated, TypedDict, List, Any, Optional, Dict
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    """
    State của True Agentic Workflow (reason → act → verify → correct).

    ┌──────────────────────────────────────────────────────────┐
    │                      AgentState                          │
    ├──────────────────────────────────────────────────────────┤
    │ user_query          → câu hỏi gốc (không đổi)            │
    │ current_query       → query dùng cho retrieval           │
    │ query_history       → các query đã rewrite               │
    │ retrieved_tools     → Top-K tools vòng hiện tại          │
    │ retrieval_history   → lịch sử retrieve                   │
    │ messages            → hội thoại Human/AI/Tool            │
    │ decision            → quyết định structured của Agent    │
    │ decision_validation → kết quả Decision Validator         │
    │ tool_calls / results→ lịch sử thực thi tool              │
    │ result_validation   → kết quả Result Evaluator           │
    │ iteration*          → bộ đếm chống infinite loop         │
    │ final_*             → payload trả FastAPI                │
    └──────────────────────────────────────────────────────────┘
    """

    # ---- Original request (immutable sau khi set) ----
    user_query: str

    # ---- Retrieval / Discovery ----
    current_query: str
    query_history: List[str]
    retrieved_tools: List[Any]          # alias semantic; sync với active_tools
    active_tools: List[Any]             # LangChain BaseTool bind vào LLM
    retrieval_history: List[Dict[str, Any]]

    # ---- Hội thoại (ReAct memory) ----
    messages: Annotated[list[AnyMessage], add_messages]

    # ---- Runtime dependencies (inject từ Service, không serialize) ----
    db: Any
    current_user: Any
    llm: Any

    # ---- Agent decision (structured) ----
    # {"action": "CALL_TOOL"|"FINAL_ANSWER"|"NEED_RETRIEVAL", ...}
    decision: Optional[Dict[str, Any]]

    # ---- Decision Validator (khi NO_TOOL / FINAL_ANSWER) ----
    # {"status": "VALID"|"INVALID", "feedback": "...", "reason": "..."}
    decision_validation: Optional[Dict[str, Any]]

    # ---- Tool execution history ----
    tool_calls: List[Dict[str, Any]]
    tool_results: List[Dict[str, Any]]
    used_tools: List[str]

    # ---- Result Evaluator (sau EXECUTE) ----
    # {"status": "SUCCESS"|"INSUFFICIENT"|"INVALID"|"RETRY",
    #  "category": "...", "feedback": "...", "should_retrieve_again": bool}
    result_validation: Optional[Dict[str, Any]]

    # ---- Loop control ----
    iteration: int                      # tổng vòng Agent
    retrieval_iteration: int            # số lần rewrite/retrieve discovery
    execution_iteration: int            # số lần execute tool
    max_iterations: int
    max_retrieval_retries: int
    max_execution_steps: int

    # ---- Progress (high-level, không expose CoT) ----
    progress: Optional[str]

    # ---- Kết quả API ----
    # final_status: "SUCCESS" | "WAIT_CONFIRM" | "CHAT" | "ERROR"
    final_status: Optional[str]
    final_message: Optional[str]
    action_id: Optional[str]
