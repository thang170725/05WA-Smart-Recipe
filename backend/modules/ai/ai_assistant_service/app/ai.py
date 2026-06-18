# backend/modules/ai/ai_assistant_service/app/ai.py
import asyncio
from sqlalchemy.orm import Session
from langchain_core.messages import SystemMessage, HumanMessage

from backend.modules.ai.ai_assistant_service.app.config.settings import get_llm, FRIENDLY_PROMPT
from backend.modules.ai.ai_assistant_service.tools import get_relevant_tools_by_rag_mysql, handle_read_tool_execution

PENDING_ACTIONS = {}

class AIAssistantService:
    def __init__(self, current_user=None, db: Session = None, option: str = "key"):
        self.current_user = current_user
        self.db = db
        self.llm = get_llm(option=option)

    async def run_pipline(self, input_text: str):
        print(f"\n[AI Agent] Nhận yêu cầu: '{input_text}'")
        
        # 1. Gọi RAG quét DB MySQL lấy ra các Tool đọc phù hợp nhất
        relevant_tools = get_relevant_tools_by_rag_mysql(self.db, input_text, top_k=2)
        
        if relevant_tools:
            print(f"[AI Agent] Đã bốc từ MySQL các công cụ: {[t.__name__ for t in relevant_tools]}")
            dynamic_llm = self.llm.bind_tools(relevant_tools)
        else:
            dynamic_llm = self.llm

        SYSTEM_PROMPT = "Bạn là trợ lý ảo Smart-Recipe. Hãy sử dụng công cụ phù hợp để trả lời."

        ai_msg = dynamic_llm.invoke([
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=input_text)
        ])

        if not ai_msg.tool_calls:
            return {"status": "CHAT", "message": ai_msg.content}

        tool_call = ai_msg.tool_calls[0]
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        
        print(f"[AI Agent] Gemini chọn Tool: {tool_name}")

        # Xử lý gọi hàm ĐỌC tự động
        raw_data = await handle_read_tool_execution(
            tool_name=tool_name,
            args=tool_args,
            db=self.db,
            user_id=self.current_user.id
        )
        print(f"[DEBUG RAW DATA] Dữ liệu thô gửi sang Gemini: {raw_data}")
        # Chuyển data thô qua LLM để sinh câu thoại thân thiện
        friendly_response = self.llm.invoke(FRIENDLY_PROMPT(str(raw_data)))
        return {
            "status": "SUCCESS",
            "message": friendly_response.content
        }

# KỊCH BẢN CHẠY TEST CHỨC NĂNG ĐỌC
async def test_read_only():
    class MockUser: id = 1
    class MockUserRepoResult:
        # Giả lập trả về dữ liệu khi các hàm repo trong user_tools được gọi
        def __str__(self): return "Dữ liệu tài khoản: Lê Đức Thắng, Email: thang@gmail.com, SĐT: 0123456789"

    class MockDB:
        def query(self, model):
            # Thao tác này để phục vụ luồng RAG lấy danh sách ToolRegistryModel trong DB thật
            from backend.core.database import SessionLocal
            _real_db = SessionLocal()
            return _real_db.query(model)
        
        def execute(self, stmt):
            class MockScalar:
                def scalar_one_or_none(self): return MockUserRepoResult()
            return MockScalar()

    ai_assistant = AIAssistantService(current_user=MockUser(), db=MockDB())
    
    print("=========================================================")
    print("===            TEST RAG READ-ONLY PIPELINE            ===")
    print("=========================================================")
    
    # Thử nghiệm câu lệnh lấy Email
    res = await ai_assistant.run_pipline("Xem hộ tôi cái email với")
    print("Kết quả trả về Frontend:\n", res)
    
if __name__ == "__main__":
    asyncio.run(test_read_only())