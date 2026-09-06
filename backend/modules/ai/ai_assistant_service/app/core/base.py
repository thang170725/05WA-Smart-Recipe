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
from backend.modules.user.models import User

# ====================================
# ====== luồng xử lý helper ========
# ====================================
def format_user_profile_context(user: User) -> str:
    """Hàm bóc tách thông tin từ SQLAlchemy Model User sang dạng text cho LLM dễ hiểu"""
    if not user:
        return "Không có thông tin cá nhân của người dùng."

    # Map các enum/giá trị sang Tiếng Việt để Prompt hiểu rõ hơn
    gender_map = {'male': 'Nam', 'female': 'Nữ', 'other': 'Khác'}
    goal_map = {
        'lose_weight': 'Giảm cân/Giảm mỡ',
        'gain_muscle': 'Tăng cơ',
        'maintenance': 'Duy trì vóc dáng'
    }
    activity_map = {
        'sedentary': 'Ít vận động',
        'light': 'Vận động nhẹ',
        'moderate': 'Vận động vừa phải',
        'active': 'Năng động',
        'very_active': 'Cường độ cao'
    }

    # Bóc tách từng trường thuộc tính từ class User của bạn
    fullname = user.fullname or "N/A"
    gender = gender_map.get(user.gender, "N/A")
    height = f"{user.current_height} cm" if user.current_height else "N/A"
    weight = f"{user.current_weight} kg" if user.current_weight else "N/A"
    goal = goal_map.get(user.target_goal, "Không xác định")
    activity = activity_map.get(user.activity_level, "Bình thường")

    return f"""- Họ tên: {fullname}
- Giới tính: {gender}
- Chiều cao: {height}
- Cân nặng hiện tại: {weight}
- Mục tiêu thể hình: {goal}
- Mức độ hoạt động: {activity}"""

# ====================================================
# ======= luồng xử lý các node trong graph =========
# ====================================================
# node rewritting câu hỏi của người dùng
def rewrite_query_node(state: AgentState):
    """
    Node tiền xử lý: Lấy câu hỏi thô từ user + thông tin user (Profile/Health/Goals)
    để LLM viết lại thành 1 câu đầy đủ ngữ cảnh nhất.
    """
    raw_user_input = state["messages"][-1].content
    user = state.get("current_user")
    llm = state["llm"]

    # 2. Tạo Prompt bắt LLM viết lại câu hỏi
    REWRITE_SYSTEM_PROMPT = f"""Bạn là một chuyên gia tối ưu hóa truy vấn tìm kiếm cho hệ thống RAG (Retrieval-Augmented Generation) về ẩm thực và sức khỏe.

Nhiệm vụ của bạn:
Chuyển đổi câu hỏi tự nhiên của người dùng thành MỘT TRUY VẤN TÌM KIẾM CHUYÊN NGHỆP nhằm tối ưu hóa việc truy vấn cơ sở dữ liệu.

Quy tắc bắt buộc:
1. Sửa toàn bộ lỗi chính tả, gõ sai (ví dụ: "gaagầy" -> "người gầy").
2. Bổ sung các từ khóa chuyên ngành liên quan (ví dụ: "calo", "dinh dưỡng", "thực đơn", "chỉ số BMR/TDEE") nếu câu hỏi liên quan đến tăng/giảm cân.
3. Nếu là câu hỏi ngắn/thiếu ngữ cảnh, hãy làm rõ ý định của người dùng.
4. KHÔNG trả lời câu hỏi, CHỈ trả về đúng 1 câu truy vấn đã được tối ưu.

Ví dụ:
- Input: "làm sao để người gaagầy tăng 5kg trong vòng 1 tháng"
- Output: "Thực đơn dinh dưỡng và phương pháp tăng cân an toàn cho người gầy tăng 5kg một tháng"

- Input: "ăn món hải sản nào giàu chất protein nhất hiện nay"
- Output: "Danh sách các loại hải sản có hàm lượng protein cao nhất và giá trị dinh dưỡng"

Câu gốc của user: {raw_user_input}

[CÂU HỎI ĐÃ LÀM RÕ]:"""

    print(f"[AI Agent - Node Rewrite] Đang viết lại câu hỏi: '{raw_user_input}'...")
    
    # 3. Gọi LLM để viết lại câu
    response = llm.invoke([HumanMessage(content=REWRITE_SYSTEM_PROMPT)])

    # --- BẮT ĐẦU SỬA: Bóc tách content an toàn ---
    raw_content = response.content

    if isinstance(raw_content, str):
        rewritten_text = raw_content.strip()
    elif isinstance(raw_content, list):
        # Trường hợp Gemini trả về dạng list các phần tử/dict text
        text_parts = []
        for part in raw_content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
            elif hasattr(part, "text"):
                text_parts.append(part.text)
        rewritten_text = "".join(text_parts).strip()
    else:
        rewritten_text = str(raw_content).strip()
    # --- KẾT THÚC SỬA ---
    
    print(f"[AI Agent - Node Rewrite] Kết quả sau rewrite: '{rewritten_text}'")

    # 4. Cập nhật câu hỏi mới vào tin nhắn cuối cùng
    updated_messages = state["messages"].copy()
    updated_messages[-1] = HumanMessage(content=rewritten_text)

    return {
        "rewritten_input": rewritten_text,
        "messages": updated_messages
    }

def extract_text_from_response(response) -> str:
    """Hàm trợ giúp: Bóc tách text an toàn từ response của LLM 

    (Tương thích cả Ollama trả về str lẫn Gemini API trả về list/parts)
    """
    if hasattr(response, "text") and response.text:
        return response.text.strip()

    content = getattr(response, "content", response)

    if isinstance(content, str):
        return content.strip()
    elif isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
            elif hasattr(part, "text"):
                text_parts.append(part.text)
        return "".join(text_parts).strip()

    return str(content).strip()

def classify_intent_node(state: AgentState):
    """Trạm 0: Phân loại xem user muốn Chat xã giao hay gọi Tool API"""
    user_input = state["messages"][-1].content
    llm = state["llm"]

    # Prompt tối ưu nhỏ gọn để LLM phân loại nhanh
    CLASSIFY_PROMPT = classify_prompt(user_input=user_input)

    try:
        response = llm.invoke(CLASSIFY_PROMPT)

        # Sử dụng helper bóc tách text an toàn thay vì response.content.strip()
        predicted_intent = extract_text_from_response(response).upper()

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
    """Node sinh câu trả lời thân thiện"""
    intent = state.get("intent", "UNKNOWN")
    llm = state["llm"]

    # Lấy message cuối cùng của user (hoặc câu đã rewrite nếu có)
    user_input = state.get("rewritten_input") or state["messages"][-1].content

    # Đảm bảo user_input không bị rỗng/blank làm Gemini báo lỗi 'contents are required'
    if not user_input or not user_input.strip():
        user_input = "Xin chào"

    # Gọi prompt tạo phản hồi
    prompt_content = friendly_prompt(data=intent, user_input=user_input)

    # Đảm bảo prompt truyền vào SystemMessage/HumanMessage luôn có nội dung
    if not prompt_content or not prompt_content.strip():
        prompt_content = f"Hãy trả lời câu hỏi sau của người dùng một cách lịch sự: {user_input}"

    # Gemini API cần cấu trúc message rõ ràng (chuyển sang HumanMessage nếu SystemMessage gặp vấn đề)
    ai_response = llm.invoke([HumanMessage(content=prompt_content)])

    # Bóc tách kết quả trả về an toàn
    final_text = extract_text_from_response(ai_response)

    return {"final_status": "SUCCESS", "final_message": final_text}


# ====================================================
# ======= route điều hướng graph ====================
# ====================================================
def route_after_classify(state: AgentState) -> str:
    """Hàm quyết định sau khi Phân loại Intent thì đi về đâu"""
    intent = state.get("intent", "UNKNOWN")

    if intent == "TOOL_REQUEST":
        return "need_tools"  # Nhánh đi sang Node retrieve
    else:
        return "friendly_chat"  # Nhánh kết thúc