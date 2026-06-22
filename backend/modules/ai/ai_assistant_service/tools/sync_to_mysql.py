from dotenv import load_dotenv
load_dotenv()
import os

from google import genai
from google.genai import types

from backend.core.database import SessionLocal
from sqlalchemy.orm import Session

from backend.modules.ai.ai_assistant_service.tools import ALL_READ_TOOLS, ALL_WRITE_TOOLS
from backend.modules.ai.ai_assistant_service.app.models import AIToolRegistryModel

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", default=None)
if not GOOGLE_API_KEY:
    print("KHÔNG CÓ API KEY")

client = genai.Client(api_key=GOOGLE_API_KEY)

def get_gemini_embedding(text: str):
    """Gọi SDK mới để biến một chuỗi thành Vector 768 chiều"""
    response = client.models.embed_content(
        model="gemini-embedding-2",  # Không cần tiền tố models/ nữa
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT"  # Ép kiểu enum chuẩn viết hoa
        )
    )

    # Cú pháp trích xuất mảng số của SDK mới: response.embeddings[0].values
    return response.embeddings[0].values

def sync_tools_to_mysql():
    """Quy trình nạp dữ liệu nền móng của Developer xuống MySQL"""
    db: Session = SessionLocal()
    print("[DEV] Khởi động tiến trình quét mã nguồn chuyển đổi Vector (google-genai SDK)...")

    ALL_SYSTEMS_TOOLS = ALL_READ_TOOLS + ALL_WRITE_TOOLS
    
    try:
        for tool_class in ALL_SYSTEMS_TOOLS:
            tool_name = tool_class.__name__
            tool_desc = tool_class.__doc__ if tool_class.__doc__ else "Không có mô tả."
            
            # Tạo chuỗi văn bản chứa ngữ nghĩa của tính năng
            text_to_vector = f"Chức năng hệ thống: {tool_name}. Chi tiết công dụng: {tool_desc}"
            
            # Biến chuỗi text thành mảng số Vector 768 chiều
            vector_data = get_gemini_embedding(text_to_vector)
            
            # Kiểm tra xem Tool này đã tồn tại dưới DB chưa
            existing_tool = db.query(AIToolRegistryModel).filter(AIToolRegistryModel.name == tool_name).first()
            
            if existing_tool:
                existing_tool.description = tool_desc
                existing_tool.embedding = vector_data  # Ghi đè mảng Vector mới (SQLAlchemy tự serialize sang JSON)
                print(f"-> Cập nhật Vector thành công cho Tool: {tool_name}")
            else:
                new_registry = AIToolRegistryModel(
                    name=tool_name,
                    description=tool_desc,
                    embedding=vector_data
                )
                db.add(new_registry)
                print(f"-> Thêm mới thành công Vector cho Tool: {tool_name}")
                
        db.commit()
        print("[DEV] TIẾN TRÌNH HOÀN TẤT: Toàn bộ công cụ đã được số hóa vào MySQL!")
        
    except Exception as e:
        db.rollback()
        print(f"[ERR] Lỗi khi đồng bộ dữ liệu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sync_tools_to_mysql()