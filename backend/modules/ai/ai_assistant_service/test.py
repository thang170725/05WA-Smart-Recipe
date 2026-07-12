from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

from typing import Annotated, TypedDict, List, Dict, Any, Optional

from langchain_core.messages import SystemMessage, HumanMessage, AnyMessage

class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    db: Any
    current_user: Any
    llm: Any
    relevant_tools: List[Any]
    
    # Kết quả trả ra cuối cùng cho API
    final_status: Optional[str]
    final_message: Optional[str]
    action_id: Optional[str]

def print_ai_agent(state: AgentState):
    return state

workflow = StateGraph(AgentState)
workflow.add_node("print_ai_agent", print_ai_agent)

workflow.add_edge(START, 'print_ai_agent')
workflow.add_edge("print_ai_agent", END)

print(workflow.edges)