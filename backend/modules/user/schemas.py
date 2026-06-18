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

    model_config = ConfigDict(from_attributes=True)

class InputUpdatePasswordSchema(BaseModel):
    password: Optional[str] = None



# BOTH INPUT & OUTPUT
class IOUpdateProfileSchema(BaseModel):
    fullname: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    activity_level: Optional[str] = None
    target_goal: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ===== FORGOT PASSWORD ===== 
# SEND EMAIL API
class InputSendEmailSchema(BaseModel):
    email: str

# VERIFY EMAIL SCHEMA
class InputVerifyEmailSchema(BaseModel):
    email: str
    otp: str

# RESET PASSWORD
class InputResetPasswordSchema(BaseModel):
    email: str
    new_password: str