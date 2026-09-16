from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import date

# ==============================================================
# ===== chức năng dự đoán cân nặng bằng machine learning =======
# ==============================================================
class InputPostHealthFormSchema(BaseModel):
    activity_level: str
    age: int
    gender: str 
    height: float | int
    target_goal: str
    weight: int | float

    week_start: date | str