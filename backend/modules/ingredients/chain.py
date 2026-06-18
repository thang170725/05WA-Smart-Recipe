from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
import json, re

llm = ChatOllama(
    model="llama3",
    temperature=0
)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "Bạn là chuyên gia dinh dưỡng và ẩm thực Việt Nam, cực kỳ tuân thủ yêu cầu."),
    ("human",
     """
Nguyên liệu được phép:
{ingredients}

LUẬT BẮT BUỘC:
- CHỈ được dùng các nguyên liệu trên
- Gia vị cơ bản CHỈ gồm: muối, tiêu, dầu ăn, nước mắm
- KHÔNG được thêm bất kỳ nguyên liệu nào khác
- Nếu món ăn cần nguyên liệu khác → KHÔNG đề xuất

Yêu cầu:
- Tối đa 5 món
- Giàu dinh dưỡng
- Chi phí thấp
- Ưu tiên dùng hết nguyên liệu

Trước khi trả kết quả:
- Tự kiểm tra từng món
- Loại bỏ món vi phạm nguyên liệu

Trả về MỘT MẢNG JSON DUY NHẤT:

[
  {{
    "name": "",
    "description": "",
    "nutrition_reason": "",
    "cost": "rẻ | trung bình",
    "nutrition_score": 1
  }}
]
""")
])


chain = prompt | llm


def safe_json_parse(text: str):
    match = re.search(r"\[\s*{.*?}\s*\]", text, re.S)
    if not match:
        raise ValueError(f"Output không hợp lệ:\n{text}")

    return json.loads(match.group())


def run_chain(ingredients: list[str]):
    result = chain.invoke({
        "ingredients": ", ".join(ingredients)
    })
    return safe_json_parse(result.content)


if __name__ == "__main__":
    print(run_chain(['thịt heo', 'xả', 'trứng']))
