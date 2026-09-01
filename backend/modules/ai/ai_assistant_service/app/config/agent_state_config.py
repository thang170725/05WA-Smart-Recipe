from typing import Annotated, TypedDict, List, Dict, Any, Optional
from langchain_core.messages import SystemMessage, HumanMessage, AnyMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
# =================================================================
# 1. ĐỊNH NGHĨA STATE CHO LANGGRAPH
# State này sẽ chạy xuyên suốt qua các Node để truyền dữ liệu
# =================================================================
class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    db: Any
    current_user: Any
    llm: Any
    relevant_tools: List[Any]

    intent: Optional[str]  # Giá trị sẽ là: "TOOL_REQUEST", "GENERAL_CHAT", hoặc "UNKNOWN", "OUTSIDE"
    
    # Kết quả trả ra cuối cùng cho API
    final_status: Optional[str]
    final_message: Optional[str]
    action_id: Optional[str]