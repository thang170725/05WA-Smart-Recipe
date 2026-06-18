from langchain_community.chat_models import ChatOllama

class ResponseFormatter:
    def __init__(self):
        self.model = ChatOllama(
            model="mistral",
            temperature=0
        )

    def format(self, question: str, data):
        if data is None or data == "":
            return "Thông tin này của bạn hiện chưa được cập nhật."

        prompt = f"""
Bạn là hệ thống viết lại câu trả lời.

Câu hỏi của người dùng:
"{question}"

Dữ liệu hệ thống (phải sử dụng nguyên văn, không thay đổi):
"{data}"

Yêu cầu cực kỳ quan trọng:
- Không được thêm dữ liệu mới
- Không được suy đoán
- Không được thay đổi nội dung dữ liệu
- Phải giữ nguyên chính xác dữ liệu giữa dấu ngoặc kép
- Chỉ được viết lại cho tự nhiên hơn
- Trả lời bằng tiếng Việt, lịch sự

Chỉ trả về câu trả lời cuối cùng.
"""
        response = self.model.invoke(prompt)
        return response.content.strip()
