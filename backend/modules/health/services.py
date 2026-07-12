from sympy import E
from backend.modules.health.reponsitories import HealthMetricRepo

from sqlalchemy.orm import Session


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

class HealthMetricService:
    def __init__(self):
        self.repo = HealthMetricRepo()

    # ======== GET =========
    # get all info in health_metrics
    def get_health_metrics_info_service(self, db:Session, user_id: int):
        try:
            health_metric = self.repo.get_health_metrics_info_repo(db, user_id)

            return health_metric
        except Exception as e:
            raise ValueError(e)
