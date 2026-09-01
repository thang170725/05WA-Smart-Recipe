from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import date

# ===== REGISTER =======
class InputRegisterSchema(BaseModel):
    fullname: str
    birth_date: date
    age: int
    password: str
    address: Optional[str]
    phone: Optional[str]
    gender: Literal['male', 'female', 'other']
    email: str
class OutputRegisterSchema(BaseModel):
    status: Literal["success", "failed"]

# ==== LOGIN SCHEMA =====
class InputLoginSchema(BaseModel):
    username: str
    password: str

# ====== PROFILE USER SCHEMA ======
class OutputProfileUserSchema(BaseModel):
    id: int
    email: str
    role: str
    fullname: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    target_goal: Optional[str] = None
    avatar_url: Optional[str] = None 
    height: Optional[str | float] = None
    weight: Optional[str | float] = None

    model_config = ConfigDict(from_attributes=True)

class InputUpdatePasswordSchema(BaseModel):
    password: str

# ====================================
# ===== chức năng cập nhật profile ===== 
# ====================================
# BOTH INPUT & OUTPUT
class InputUpdateProfileSchema(BaseModel):
    id: Optional[int] = None
    fullname: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date | str] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    target_goal: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ====================================
# ===== forgot password function ===== 
# ====================================
# send otp to email
class InputSendEmailSchema(BaseModel):
    email: str

# VERIFY EMAIL SCHEMA
class InputVerifyOtpSchema(BaseModel):
    email: str
    otp: str

# RESET PASSWORD
class InputResetPasswordSchema(BaseModel):
    email: str
    new_password: str