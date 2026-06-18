from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()

# ====== CONSTANT SETTINGS ======
SYSTEM_PROMPT = """
Bạn là AI classifier cho website dinh dưỡng và luyện tập.

Nhiệm vụ:
- Xác định domain
- Xác định intent
- Trích xuất parameters
- Đánh giá confidence (0-1)

Chỉ trả về JSON hợp lệ theo schema.
"""

def FRIENDLY_PROMPT(data_dict_str):
    return f"""
Bạn là AI trợ lý cá nhân của hệ thống Smart-Recipe.

Dữ liệu hệ thống vừa truy vấn được (Dạng chuỗi Dict/JSON):
{data_dict_str}

Nhiệm vụ:
- Dựa vào dữ liệu hệ thống cung cấp ở trên, hãy trả lời câu hỏi của người dùng một cách tự nhiên và thân thiện.
- Trong dữ liệu có trường (key) nào thì chỉ tập trung trả lời trúng đích trường đó. Tuyệt đối KHÔNG tự bịa ra hoặc liệt kê các trường khác không xuất hiện trong dữ liệu được cho.

Quy tắc:
- Trả lời ngắn gọn, trực diện, đi thẳng vào thông tin người dùng cần.
- Không thêm câu dư thừa, không dùng từ ngữ sáo rỗng.
- Trả lời bằng tiếng Việt.

Trả lời:
"""

# ==== LAYER 1 =======
# prompt cung cấp ngữ cảnh cho ai ở layer 1
def layer_1_prompt(input):
    return f'''
Bạn là hệ thống phân loại intent.

Phân loại câu sau vào 1 trong các loại:

- READ: 
    khi người dùng muốn xem, đọc, lấy thông tin từ database
    Ví dụ:
    + "tôi muốn xem thông tin cá nhân"
    + "cho tôi xem lịch tập hôm nay"

- UPDATE: 
    khi người dùng muốn thay đổi dữ liệu trong database
    Ví dụ:
    + "cập nhật cân nặng thành 70kg"
    + "đổi địa chỉ của tôi thành Đà Nẵng"

- CHAT: 
    khi người dùng chào hỏi, trò chuyện, hỏi đáp thông thường, giao tiếp xã hội hoặc hỏi kiến thức chung.
    Ví dụ:
    + "xin chào"
    + "bạn là ai"
    + "hôm nay tôi nên ăn gì"
    + "protein là gì"

- UNKNOWN: 
    không xác định được intent hoặc câu vô nghĩa

Quy tắc:
- Nếu là giao tiếp bình thường -> CHAT
- Nếu không chắc chắn -> UNKNOWN

Câu: "{input}"
'''

# ==== LAYER 2 =======
def layer_2_prompt_read(original_text):
    return f"""
Bạn là hệ thống phân loại intent

Lưu ý:
    + Nếu không chắc chắn → confidence < 0.7

Chọn 1 trong các loại:
- READ_USER: xem thông tin của user
- READ_MEAL_ADAY: xem danh sách món ăn trong 1 ngày 
- READ_WORKOUT_AWEEK: xem lịch tập của 1 tuần
- READ_WORKOUT_ADAY: xem chi tiết các bài tập trong 1 ngày

Ví dụ:
- "Tôi muốn xem thông tin cá nhân" → READ_USER
- "tôi cần xem lich tập hôm nay" → READ_WORKOUT_ADAY
- "tôi muốn xem lich tập của tuần này" -> READ_WORKOUT_AWEEK

Câu: "{original_text}"
"""

def layer_2_prompt_update(original_text):
    return f"""
Bạn là hệ thống chọn chức năng cập nhật dữ liệu.

Chọn 1 trong các loại:

- UPDATE_ADDRESS: cập nhật địa chỉ hiện tại sang một địa chỉ khác
- UPDATE_HEIGHT: cập nhật chiều cao hiện tại sang một chiều cao khác, đơn vị cm
- UPDATE_WEIGHT: cập nhật cân nặng hiện tại sang một cân nặng mới, đơn vị kg

Ví dụ:
    - "Tôi muốn cập nhật cân nặng thành 50 kg" → UPDATE_WEIGHT  
    - "tôi muốn thay đổi địa chỉ của tôi thành 'hoài đức, hà nội'" -> UPDATE_ADDRESS 

Câu: "{original_text}"
Nếu không chắc chắn → confidence < 0.7
"""

def get_llm(option: str = "local"):
    if option == "local":
        return ChatOllama(
            model="qwen:1.8b",
            temperature=0,
            request_timeout=60,
        )
    else:
        api_key = os.getenv("GOOGLE_API_KEY", default=None)
        if not api_key:
            raise ValueError("api_key is none")
        
        return ChatGoogleGenerativeAI(
            model="models/gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
            request_timeout=60
        )

if __name__ == "__main__":
    from google import genai
    api_key = os.getenv("GOOGLE_API_KEY", default=None)

    client = genai.Client(api_key=api_key)

    for m in client.models.list():
        print(m.name)