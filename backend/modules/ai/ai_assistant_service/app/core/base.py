#
# ======= nơi setup logging =======
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)
#
# ===== nơi import thư viện ======
#
from langchain_core.messages import HumanMessage, SystemMessage

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.config.prompt_config import (
    classify_prompt, friendly_prompt
)

# ====================================================
# ======= luồng xử lý các node trong graph =========
# ====================================================
def classify_intent_node(state: AgentState):
    """Trạm 0: Phân loại xem user muốn Chat xã giao hay gọi Tool API"""
    user_input = state["messages"][-1].content
    llm = state["llm"]

    # Prompt tối ưu nhỏ gọn để LLM phân loại nhanh
    CLASSIFY_PROMPT = classify_prompt(user_input=user_input)

    try:
        response = llm.invoke(CLASSIFY_PROMPT)
        predicted_intent = response.content.strip().upper()

        # Chuẩn hóa kết quả trả về
        if "TOOL_REQUEST" in predicted_intent:
            intent = "TOOL_REQUEST"
        elif "GENERAL_CHAT" in predicted_intent:
            intent = "GENERAL_CHAT"
        else:
            intent = "UNKNOWN"
            
    except Exception as e:
        logger.error(f"[AI Agent] Lỗi khi phân loại Intent: {e}")
        intent = "UNKNOWN"

    logger.debug(f"[AI Agent] Ý định người dùng được phân loại là: {intent}")
    return {"intent": intent}

def friendly_answer_node(state: AgentState):
    '''
    Node sinh câu trả lời thân thiện
    '''
    intent = state.get('intent', 'UNKNOWN')
    llm = state['llm']

    # lấy message cuối cùng của user để LLM có ngữ cảnh khi trả lời
    user_input = state["messages"][-1].content

    # gọi prompt tạo phản hồi
    prompt = friendly_prompt(data=intent, user_input=user_input)

    ai_response = llm.invoke([
        # HumanMessage(content=user_input),
        SystemMessage(content=prompt)
    ])

    return {
      "final_status": "SUCCESS",
      "final_message": ai_response.content  
    }
# ====================================================
# ======= route điều hướng graph ====================
# ===================================================
def route_after_classify(state: AgentState) -> str:
    """Hàm quyết định sau khi Phân loại Intent thì đi về đâu"""
    intent = state.get("intent", "UNKNOWN")
    
    if intent == "TOOL_REQUEST":
        return "need_tools"     # Nhánh đi sang Node retrieve
    else:
        return "friendly_chat"     # Nhánh kết thúc