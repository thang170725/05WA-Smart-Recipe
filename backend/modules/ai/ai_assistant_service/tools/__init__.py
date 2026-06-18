# backend/modules/ai/ai_assistant_service/tools/__init__.py
import os
from dotenv import load_dotenv

import numpy as np
from google import genai
from google.genai import types

from backend.modules.ai.ai_assistant_service.tools.user_tools import *
from backend.modules.ai.ai_assistant_service.app.models import AIToolRegistryModel

# =========================================================
# 1. ĐỊNH NGHĨA ALL_SYSTEMS_TOOLS Ở ĐÂY ĐỂ FILE SYNC ĐỌC ĐƯỢC
# =========================================================
ALL_SYSTEMS_TOOLS = [
    GetInfoUserInput,
    GetEmailUserInput,
    GetFullnameUserInput,
    GetPhoneUserInput,
    GetBirthDateUserInput,
    GetAddressUserInput
]

# Khởi tạo client dùng chung cho tầng xử lý logic
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", default=None)
if not GOOGLE_API_KEY:
    print("KHÔNG CÓ API KEY")

client = genai.Client(api_key=GOOGLE_API_KEY)

# Gom các tool đọc của bạn vào TOOL_MAP
TOOL_MAP = {
    "GetInfoUserInput": GetInfoUserInput,
    "GetEmailUserInput": GetEmailUserInput,
    "GetFullnameUserInput": GetFullnameUserInput,
    "GetPhoneUserInput": GetPhoneUserInput,
    "GetBirthDateUserInput": GetBirthDateUserInput,
    "GetAddressUserInput": GetAddressUserInput
}

def cosine_similarity(v1, v2):
    """Tính toán độ tương đồng hình học giữa 2 mảng vector số"""
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def get_relevant_tools_by_rag_mysql(db_session, user_input: str, top_k: int = 3):
    """
    RAG THẬT SỰ: Truy vấn và so sánh khoảng cách ngữ nghĩa trực tiếp từ MySQL sử dụng google-genai
    """
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=user_input,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY"
        )
    )
    user_query_vector = np.array(response.embeddings[0].values)
    
    db_tools = db_session.query(AIToolRegistryModel).all()
    
    scored_tools = []
    for row in db_tools:
        tool_vector = np.array(row.embedding)
        score = cosine_similarity(user_query_vector, tool_vector)
        scored_tools.append((row.name, score))
        
    scored_tools.sort(key=lambda x: x[1], reverse=True)
    print(f"[RAG ENGINE] Điểm số khớp lệnh từ MySQL: {scored_tools}")
    
    final_tools = []
    for tool_name, score in scored_tools[:top_k]:
        if score > 0.55 and tool_name in TOOL_MAP:
            final_tools.append(TOOL_MAP[tool_name])
            
    return final_tools

# Bổ sung đầy đủ router điều phối cho các hàm ĐỌC (READ) của bạn
async def handle_read_tool_execution(tool_name: str, args: dict, db, user_id: int):
    if tool_name == "GetInfoUserInput":
        return await execute_get_info_user(db, user_id)
    elif tool_name == "GetEmailUserInput":
        return await execute_get_email(db, user_id)
    elif tool_name == "GetFullnameUserInput":
        return await execute_get_fullname(db, user_id)
    elif tool_name == "GetPhoneUserInput":
        return await execute_get_phone(db, user_id)
    elif tool_name == "GetBirthDateUserInput":
        return await execute_get_birth_date(db, user_id)
    elif tool_name == "GetAddressUserInput":
        return await execute_get_address(db, user_id)
    return None