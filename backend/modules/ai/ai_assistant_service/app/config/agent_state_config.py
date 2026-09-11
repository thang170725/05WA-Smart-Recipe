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

    Input:
    - total=False: tất cả các field đều có optional về mặt typing
    Output:
    - active_tools=list: LLM hiện tại được phép dùng những tool nào?
    - retrieved_tools=list: rag tìm thấy những tool nào
    - retrieval_history: lịch sử retrieve\n
      [
          {
              "query": "Email của tôi là gì?",
              "tools": ["get_user_email", "get_profile"],
              "top_k": 5
          },
          {
              "query": "user email address",
              "tools": ["get_user_email"],
              "top_k": 5
          }
      ]
    - messages=list[AnyMessage]: hội thoại Human/AI/Tool 
      [
        HumanMessage(content="Email của tôi là gì?"),
        AIMessage(content="Tôi sẽ kiểm tra thông tin của bạn."),
        ToolMessage(content="user@example.com"),
        AIMessage(content="Email của bạn là user@example.com")
      ]
    - max_retrieval_retries: dùng để giới hạn số lần Agent quay lại bước Retrieval/rewrite khi lần tìm kiếm trước không đạt yêu cầu
    - max_iterations=int: giới hạn tổng số vòng agent
    - user_query=str: câu hỏi gốc của người dùng (không đổi trong quá trình suy luận AI Agent)

    ┌──────────────────────────────────────────────────────────┐
    │                      AgentState                          │
    ├──────────────────────────────────────────────────────────┤
    │ current_query       → query dùng cho retrieval           │
    │ query_history       → các query đã rewrite               │
    │ retrieved_tools     → Top-K tools vòng hiện tại          │
    │ decision            → quyết định structured của Agent    │
    │ decision_validation → kết quả Decision Validator         │
    │ tool_calls / results→ lịch sử thực thi tool              │
    │ result_validation   → kết quả Result Evaluator           │
    │ iteration*          → bộ đếm chống infinite loop         │
    │ final_*             → payload trả FastAPI                │
    └──────────────────────────────────────────────────────────┘
    """

    # ---- Original request (immutable sau khi set) ----
    user_query: str # đây là câu hỏi gốc của user

    # ---- Retrieval / Discovery ----
    current_query: str # đây là query hiện tại dùng cho retrieval (current_query có thể thay đổi qua từng vòng)
    query_history: List[str] # lưu tất cả query đã từng sử dụng/rewrite (state["query_history"] = ["Email của tôi là gì?", "user email", "user email address"]) - để biết agent đã thử những query nào
    retrieved_tools: List[Any] # đây là những tool mà retrival tìm được ở vòng lặp hiện tại
    active_tools: List[Any] # đây là những tools hiện đang được bind vào LLM
    retrieval_history: List[Dict[str, Any]] # lưu lịch sử retrieval

    # ---- Hội thoại (ReAct memory) ----
    messages: Annotated[list[AnyMessage], add_messages] # chứa conversation/message history

    # ---- Runtime dependencies (inject từ Service, không serialize) ----
    db: Any
    current_user: Any # user hiện tại đang thực hiện query
    llm: Any

    # ---- Agent decision (structured) ----
    # {"action": "CALL_TOOL"|"FINAL_ANSWER"|"NEED_RETRIEVAL", ...}
    decision: Optional[Dict[str, Any]]

    # ---- Decision Validator (khi NO_TOOL / FINAL_ANSWER) ----
    decision_validation: Optional[Dict[str, Any]] # Sau khi Agent đưa ra decision, bạn có một node khác kiểm tra decision đó. {"status": "VALID"|"INVALID", "feedback": "...", "reason": "..."}

    # ---- Tool execution history ----
    tool_calls: List[Dict[str, Any]] # lưu lịch sử những took mà agent yêu cầu gọi
    tool_results: List[Dict[str, Any]] # đây là kết quả thực tế sau khi execute tool
    used_tools: List[str] # danh sách tool đã sử dụng

    # ---- Result Evaluator (sau EXECUTE) ----
    # {"status": "SUCCESS"|"INSUFFICIENT"|"INVALID"|"RETRY",
    #  "category": "...", "feedback": "...", "should_retrieve_again": bool}
    result_validation: Optional[Dict[str, Any]] # đây là kết quả của result evaluator. nó kiểm tra tool vừa chạy có đủ để trả lời user chưa

    # ---- Loop control ----
    iteration: int                      # tổng vòng Agent
    retrieval_iteration: int            # số lần rewrite/retrieve discovery
    execution_iteration: int            # số lần execute tool
    max_iterations: int # giới hạn tổng số vòng agent
    max_retrieval_retries: int # giới hạn số lần retries
    max_execution_steps: int # giới hạn số lần execute tool

    # ---- Progress (high-level, không expose CoT) ----
    progress: Optional[str] # trạng thái high-level để bạn biết agent đang làm gì

    # ---- Kết quả API ----
    # final_status: "SUCCESS" | "WAIT_CONFIRM" | "CHAT" | "ERROR"
    final_status: Optional[str] # trạng thái cuối cùng của Agent
    final_message: Optional[str] # đây là message cuối cùng trả cho user
    action_id: Optional[str] # id của action/session/task mà agent thực hiện
