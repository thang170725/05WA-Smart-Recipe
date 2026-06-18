def bmi_analysis_note(bmi: float, body_fat: float, label: str):
    from langchain_ollama import ChatOllama
    from langchain_core.prompts import PromptTemplate

    llm = ChatOllama(model="mistral", temperature=0)

    prompt = PromptTemplate(
        input_variables=["bmi", "body_fat", "label"],
        template="""
Bạn là chuyên gia dinh dưỡng.

BMI = {bmi}
Body fat = {body_fat} %
Phân loại = {label}

⚠️ Chỉ trả về MỘT đoạn văn tiếng Việt, không JSON.
Giải thích và tư vấn ngắn gọn dưới 500 chữ.
"""
    )

    res = (prompt | llm).invoke({
        "bmi": bmi,
        "body_fat": body_fat,
        "label": label
    })

    return res.content.strip()
