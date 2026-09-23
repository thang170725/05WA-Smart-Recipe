from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import date

class GoogleCompleteRegister(BaseModel):
    registration_token: str
    fullname: str
    birth_date: date
    phone: str
    gender: str
    address: str
    current_height: float
    current_weight: float