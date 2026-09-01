#
# ======= nơi import logging ======
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
# ======= nơi import thư viện =====
#
import asyncio
import uuid
from typing import Annotated, TypedDict, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from langchain_core.messages import SystemMessage, HumanMessage, AnyMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

from backend.modules.ai.ai_assistant_service.app.config.settings import get_llm, FRIENDLY_PROMPT
from backend.modules.ai.ai_assistant_service.tools import (
    get_relevant_tools_by_rag_mysql, handle_read_tool_execution, handle_write_tool_execution,
    WRITE_TOOL_MAP, READ_TOOL_MAP
)
from backend.modules.ai.ai_assistant_service.app.core.base import (
    classify_intent_node, friendly_answer_node,
    route_after_classify,
     
)
from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState

PENDING_ACTIONS = {}


# =================================================================
# 2. ĐỊNH NGHĨA CÁC NODES (Trạm xử lý)
# =================================================================
def retrieve_tools_node(state: AgentState):
    """Trạm 1: Gọi RAG quét DB MySQL lấy ra các Tool đọc phù hợp nhất"""
    user_input = state["messages"][-1].content
    db = state["db"]
    
    relevant_tools = get_relevant_tools_by_rag_mysql(db, user_input, top_k=3)
    if relevant_tools:
        print(f"[AI Agent] Đã bốc từ MySQL các công cụ: {[t.__name__ for t in relevant_tools]}")
    
    # Trả về partial state để LangGraph cập nhật vào state tổng
    return {"relevant_tools": relevant_tools}

def call_llm_node(state: AgentState):
    """Trạm 2: Gắn Tools vào Gemini và gọi"""
    llm = state["llm"]
    tools = state["relevant_tools"]
    messages = state["messages"]
    
    # Nếu có tools thì bind vào LLM
    if tools:
        dynamic_llm = llm.bind_tools(tools)
    else:
        dynamic_llm = llm

    SYSTEM_PROMPT = "Bạn là trợ lý ảo Smart-Recipe. Hãy sử dụng công cụ phù hợp để trả lời."
    
    # Tạo mảng message có chứa SystemPrompt
    invoke_messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
    
    # Gọi AI
    ai_msg = dynamic_llm.invoke(invoke_messages)
    
    print(f"[AI Agent] Gemini phản hồi: {ai_msg}")
    return {"messages": [ai_msg]}

async def execute_read_node(state: AgentState):
    """Trạm 3.1: Xử lý nếu là luồng ĐỌC (Read)"""
    last_msg = state["messages"][-1]
    tool_call = last_msg.tool_calls[0]
    
    tool_name = tool_call["name"]
    tool_args = tool_call["args"]
    
    print(f"[AI Agent] Thực thi READ Tool: {tool_name}")
    
    raw_data = await handle_read_tool_execution(
        tool_name=tool_name,
        args=tool_args,
        db=state["db"],
        user_id=state["current_user"].id
    )
    
    # Nhờ LLM chuyển raw data thành câu nói thân thiện
    llm = state["llm"]
    friendly_response = llm.invoke(FRIENDLY_PROMPT(str(raw_data)))
    
    return {
        "final_status": "SUCCESS",
        "final_message": friendly_response.content
    }

def execute_write_node(state: AgentState):
    """Trạm 3.2: Xử lý nếu là luồng GHI (Write) - Chờ xác nhận"""
    last_msg = state["messages"][-1]
    tool_call = last_msg.tool_calls[0]
    
    tool_name = tool_call["name"]
    tool_args = tool_call["args"]
    
    print(f"[AI Agent] Thực thi WRITE Tool (Treo): {tool_name}")
    
    action_id = str(uuid.uuid4())
    
    # Treo lệnh phạt vào bộ nhớ RAM
    PENDING_ACTIONS[action_id] = {
        "user_id": state["current_user"].id,
        "intent": tool_name,
        "new_content": tool_args
    }
    
    # Nhờ Gemini tạo câu hỏi xác nhận
    llm = state["llm"]
    confirm_prompt = f"User muốn cập nhật thông tin bằng công cụ {tool_name} với dữ liệu {tool_args}. Hãy viết một câu ngắn gọn, thân thiện bằng tiếng Việt để hỏi user xem họ có chắc chắn muốn thay đổi thông tin này không."
    ai_confirm_msg = llm.invoke(confirm_prompt)
    
    return {
        "final_status": "WAIT_CONFIRM",
        "action_id": action_id,
        "final_message": ai_confirm_msg.content
    }

def handle_no_tool_node(state: AgentState):
    """Trạm 3.3: User chỉ chat bình thường, không gọi tool"""
    last_msg = state["messages"][-1]
    return {
        "final_status": "CHAT",
        "final_message": last_msg.content
    }

# =================================================================
# 3. ĐIỀU HƯỚNG ROUTER (Conditional Edges)
# =================================================================
def route_after_llm(state: AgentState) -> str:
    """Hàm này quyết định xem sau khi gọi LLM thì Graph đi về đâu"""
    last_msg = state["messages"][-1]
    
    if not last_msg.tool_calls:
        return "no_tool"
        
    tool_name = last_msg.tool_calls[0]["name"]
    if tool_name in WRITE_TOOL_MAP:
        return "write_tool"
    else:
        return "read_tool"

# =================================================================
# 4. CLASS SERVICE CHÍNH KHỞI TẠO GRAPH
# =================================================================
class AIAssistantService:
    def __init__(self, 
    current_user=None, 
    db: Session = None, 
    option: str = "key", 
    name_local="qwen2.5:1.5b",
    temperature=0.7
    ):
        self.current_user = current_user
        self.db = db
        
        self.llm = get_llm(
            option=option,
            name_local=name_local,
            temperature=temperature
        )

        self.graph = self._build_graph()

    def _build_graph(self):
        """Khởi tạo và kết nối LangGraph"""
        workflow = StateGraph(AgentState)
        
        # Thêm các Node
        workflow.add_node("classify_intent", classify_intent_node)
        workflow.add_node("friendly_answer", friendly_answer_node)
        workflow.add_node("retrieve", retrieve_tools_node)
        workflow.add_node("call_llm", call_llm_node)
        workflow.add_node("handle_read", execute_read_node)
        workflow.add_node("handle_write", execute_write_node)
        workflow.add_node("handle_chat", handle_no_tool_node)
        
        # 3. tạo đường kết nối
        workflow.add_edge(START, "classify_intent")
        # 3.1. Rẽ nhánh sau khi Classify
        workflow.add_conditional_edges(
            "classify_intent",
            route_after_classify,
            {
                "need_tools": "retrieve", # Nếu cần Tool -> Đi bốc Tool từ DB
                "friendly_chat": "friendly_answer"  # Nếu chat bình thường -> Bỏ qua retrieve, đi thẳng sang gọi LLM
            }
        )
        # 3.2 Ngắt luồng ngay sau khi friendly_answer chạy xong
        workflow.add_edge("friendly_answer", END)

        # Vẽ đường kết nối (Edges)
        workflow.add_edge("retrieve", "call_llm")
        
        # Điều hướng rẽ nhánh
        workflow.add_conditional_edges(
            "call_llm",
            route_after_llm,
            {
                "no_tool": "handle_chat",
                "read_tool": "handle_read",
                "write_tool": "handle_write"
            }
        )
        
        # Điểm kết thúc
        workflow.add_edge("handle_chat", END)
        workflow.add_edge("handle_read", END)
        workflow.add_edge("handle_write", END)
        
        return workflow.compile()

    async def run_pipline(self, input_text: str):
        """Hàm kích hoạt Graph (Endpoint chính)"""
        logger.debug(f"\n[AI Agent] Nhận yêu cầu: '{input_text}'")
        
        # Khởi tạo dữ liệu đầu vào cho State
        initial_state = {
            "messages": [HumanMessage(content=input_text)],
            "db": self.db,
            "current_user": self.current_user,
            "llm": self.llm,
            "relevant_tools": [],
            'intent': None,
            "final_status": None,
            "final_message": None,
            "action_id": None
        }
        
        # Chạy Graph (ainvoke cho luồng async)
        final_state = await self.graph.ainvoke(initial_state)
        
        # Format kết quả trả về FastAPI
        response = {
            "status": final_state["final_status"],
            "message": final_state["final_message"]
        }
        
        # Nếu là WAIT_CONFIRM thì có thêm action_id
        if final_state["action_id"]:
            response["action_id"] = final_state["action_id"]
            
        return response

    async def confirm_pending_action(self, action_id: str):
        """Hàm thực thi ghi dữ liệu (Không đưa vào Graph vì nó là 1 API độc lập chạy sau)"""
        pending = PENDING_ACTIONS.get(action_id)
        if not pending:
            return {"status": "error", "message": "Yêu cầu không tồn tại hoặc đã hết hạn."}
            
        tool_name = pending["intent"]
        tool_args = pending["new_content"]
        user_id = pending["user_id"]
        
        result = await handle_write_tool_execution(
            tool_name=tool_name,
            args=tool_args,
            db=self.db,
            user_id=user_id
        )
        
        del PENDING_ACTIONS[action_id]
        
        if result and result.get("status") == "success":
            return {"status": "success", "message": result.get("message")}
            
        return {"status": "error", "message": "Thực thi cập nhật dữ liệu thất bại."}
    
