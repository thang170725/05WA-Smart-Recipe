from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from backend.modules.ai_assistant.schemas import IntentLLMSchema
from backend.modules.ai_assistant.config import get_llm

class IntentLLMNode:
    def __init__(self):
        self.model = get_llm()
        self.parser = PydanticOutputParser(
            pydantic_object=IntentLLMSchema
        )

        self.prompt = ChatPromptTemplate.from_template("""
Bạn là hệ thống phân loại intent cấp cao.

Nhiệm vụ:
Phân loại câu người dùng thành 1 trong các nhóm sau:
- READ: người dùng yêu cầu lấy dữ liệu hệ thống. (Ví dụ: xem tài khoản, xem đơn hàng, xem thông tin cá nhân...)
- UPDATE: người dùng muốn thay đổi dữ liệu
- CHAT: Câu nói giao tiếp xã hội, small talk, hỏi thăm, không liên quan đến dữ liệu hệ thống (ví dụ: bạn khỏe không, chào bạn, hôm nay thế nào...)
- UNKNOWN: không xác định được

Chỉ trả về JSON hợp lệ theo schema. 
Không giải thích.

User: {input}

{format_instructions}
""")

        self.chain = (
            self.prompt.partial(
                format_instructions=self.parser.get_format_instructions()
            )
            | self.model
            | self.parser
        )

    def __call__(self, state):
        try:
            result = self.chain.invoke({
                "input": state.input
            })

            state.intent = result.type
            state.intent_confidence = result.confidence

        except Exception:
            state.intent = "UNKNOWN"
            state.confidence = 0.0

        return state