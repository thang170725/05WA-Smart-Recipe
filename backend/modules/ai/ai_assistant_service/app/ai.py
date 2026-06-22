# backend/modules/ai/ai_assistant_service/app/ai.py
import asyncio
from sqlalchemy.orm import Session
from langchain_core.messages import SystemMessage, HumanMessage

from backend.modules.ai.ai_assistant_service.app.config.settings import get_llm, FRIENDLY_PROMPT
from backend.modules.ai.ai_assistant_service.tools import (
    get_relevant_tools_by_rag_mysql, handle_read_tool_execution, handle_write_tool_execution,
    WRITE_TOOL_MAP
)

PENDING_ACTIONS = {}

class AIAssistantService:
    def __init__(self, current_user=None, db: Session = None, option: str = "key"):
        self.current_user = current_user
        self.db = db
        self.llm = get_llm(option=option)

    async def run_pipline(self, input_text: str):
        print(f"\n[AI Agent] Nhận yêu cầu: '{input_text}'")
        
        # 1. Gọi RAG quét DB MySQL lấy ra các Tool đọc phù hợp nhất
        relevant_tools = get_relevant_tools_by_rag_mysql(self.db, input_text, top_k=3)
        
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

        # ====================================================================
        # ĐOẠN SỬA/CHÈN MỚI: XỬ LÝ LUỒNG GHI (WRITE/UPDATE) - CHỜ USER XÁC NHẬN
        # ====================================================================
        if tool_name in WRITE_TOOL_MAP:
            import uuid
            action_id = str(uuid.uuid4())
            
            # Treo lệnh phạt vào bộ nhớ RAM chờ ông chủ bấm nút Confirm trên React
            PENDING_ACTIONS[action_id] = {
                "user_id": self.current_user.id,
                "intent": tool_name,
                "new_content": tool_args  # Chứa dict dữ liệu mới (ví dụ: {"new_birth_date": "2000-05-15"})
            }
            
            # Nhờ Gemini viết hộ một câu hỏi xác nhận thật tự nhiên dựa vào tool_args
            confirm_prompt = f"User muốn cập nhật thông tin bằng công cụ {tool_name} với dữ liệu {tool_args}. Hãy viết một câu ngắn gọn, thân thiện bằng tiếng Việt để hỏi user xem họ có chắc chắn muốn thay đổi thông tin này không."
            ai_confirm_msg = self.llm.invoke(confirm_prompt)

            return {
                "status": "WAIT_CONFIRM",
                "action_id": action_id,
                "message": ai_confirm_msg.content
            }
        # ====================================================================

        # Luồng ĐỌC (READ) tự động (Giữ nguyên bên dưới)
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

    async def confirm_pending_action(self, action_id: str):
        """Hàm thực thi ghi dữ liệu xuống MySQL khi người dùng bấm nút Xác nhận trên Frontend"""
        pending = PENDING_ACTIONS.get(action_id)
        if not pending:
            return {"status": "error", "message": "Yêu cầu không tồn tại hoặc đã hết hạn."}
            
        tool_name = pending["intent"]
        tool_args = pending["new_content"]
        user_id = pending["user_id"]
        
        # Gọi tầng điều phối thực thi ghi để cập nhật DB
        result = await handle_write_tool_execution(
            tool_name=tool_name,
            args=tool_args,
            db=self.db,
            user_id=user_id
        )
        
        # Xóa lệnh treo sau khi thực thi thành công
        del PENDING_ACTIONS[action_id]
        
        if result and result.get("status") == "success":
            return {"status": "success", "message": result.get("message")}
            
        return {"status": "error", "message": "Thực thi cập nhật dữ liệu thất bại."}

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