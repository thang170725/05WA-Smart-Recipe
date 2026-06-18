from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import date

# ===== POST HEALTH FORM =======
class InputPostHealthFormSchema(BaseModel):
    activity_level: str
    age: int
    gender: str 
    height: float | int
    month_str: str
    month_number: int
    target_goal: str
    weight: int | float