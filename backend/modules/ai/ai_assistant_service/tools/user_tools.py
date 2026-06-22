from pydantic import BaseModel, Field
from typing import Literal
from backend.modules.user.services import UserService 
from sqlalchemy.orm import Session

# ==================================
# === CỤM CHỨC NĂNG ĐỌC (READ) =====
# ==================================

class GetInfoUserInput(BaseModel):
    """Lấy toàn bộ thông tin hồ sơ cá nhân của người dùng hiện tại bao gồm email, tên, địa chỉ, số điện thoại, ngày sinh, giới tính và mục tiêu."""
    pass # Không cần tham số đầu vào vì lấy theo ID người dùng đang đăng nhập

class GetEmailUserInput(BaseModel):
    """Chỉ lấy địa chỉ email của người dùng hiện tại."""
    pass

class GetFullnameUserInput(BaseModel):
    """Chỉ lấy tên đầy đủ của người dùng hiện tại"""
    pass

class GetPhoneUserInput(BaseModel):
    """chỉ lấy số điện thoại của người dùng hiện tại"""
    pass

class GetBirthDateUserInput(BaseModel):
    """chỉ lấy ngày tháng năm sinh của người dùng hiện tại"""
    pass

class GetAddressUserInput(BaseModel):
    """chỉ lấy địa chỉ của người dùng hiện tại"""
    pass

# ===================================
# == CỤM CHỨC NĂNG CẬP NHẬT (UPDATE) ==
# ===================================
# cập nhật địa chỉ
class UpdateAddressInput(BaseModel):
    """Cập nhật hoặc thay đổi địa chỉ nơi ở của người dùng sang địa chỉ mới."""
    new_address: str = Field(description="Địa chỉ mới cần cập nhật. Ví dụ: Đà Nẵng, Hà Nội")

# cập nhật giới tính
class UpdateGenderInput(BaseModel):
    """Cập nhật hoặc thay đổi giới tính của người dùng."""
    new_gender: Literal['male', 'female', 'other'] = Field(
        description="Giới tính mới của người dùng. Bắt buộc phải là một trong ba giá trị: 'male', 'female', hoặc 'other'."
    )

# cập nhật ngày tháng năm sinh (YY-MM-DD)
class UpdateBirthDateInput(BaseModel):
    """Cập nhật hoặc thay đổi ngày tháng năm sinh của người dùng."""
    new_birth_date: str =  Field(
        description="ngày tháng năm sinh của người dùng. Bắt buộc covert về định dạnh YY-MM-DD (ví dụ: 2026-06-12), nếu người dùng nhập là ngày 12, tháng 3, năm 2025 thì vẫn phải covert kết quả về dạng 2025-03-12"
    )

# cập nhật chỉ số thể chất và mục tiêu
class UpdateFitnessGoalInput(BaseModel):
    """Cập nhật các chỉ số thể chất và mục tiêu luyện tập của người dùng (Mức độ hoạt động hoặc Mục tiêu cân nặng)."""
    activity_level: Literal['sedentary', 'light', 'moderate', 'active', 'very_active'] = Field(
        default=None,
        description="Mức độ hoạt động thể chất mới."
    )
    target_goal: Literal['lose_weight', 'gain_muscle', 'maintenance'] = Field(
        default=None,
        description="Mục tiêu vóc dáng mới của người dùng."
    )

user_service = UserService()

# ==============================
# === Thực thi Đọc thông tin ===
# ==============================
async def execute_get_info_user(db: Session, user_id: int):
    data = user_service.get_info_user_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy thông tin người dùng."}
    
    return {"status": "success", "data": data}

async def execute_get_email(db: Session, user_id: int):
    # Dùng hàm có sẵn của bạn: get_email
    data = user_service.get_email_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy email."}
    return {"status": "success", "data": data}

async def execute_get_address(db: Session, user_id: int):
    data = user_service.get_address_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy email."}
    return {"status": "success", "data": data}

async def execute_get_phone(db: Session, user_id: int):
    data = user_service.get_phone_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy email."}
    return {"status": "success", "data": data}

async def execute_get_birth_date(db: Session, user_id: int):
    data = user_service.get_birth_date_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy email."}
    return {"status": "success", "data": data}

async def execute_get_fullname(db: Session, user_id: int):
    data = user_service.get_fullname_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy email."}
    return {"status": "success", "data": data}

# ===================================
# === Thực thi cập nhật thông tin ===
# ===================================
# Thực thi Cập nhật địa chỉ
async def execute_update_address(db: Session, user_id: int, new_address: str):
    user = user_service.update_address_service(db, user_id, new_address)
    if not user:
        return {"status": "error", "message": "User not found"}
    
    return {"status": "success", "message": f"Đã cập nhật địa chỉ thành {new_address}"}

# Thực thi Cập nhật ngày tháng năm sinh (YY-MM-DD)
async def execute_update_birth_date(db: Session, user_id: int, new_birth_date: str):
    user = user_service.update_birth_date_service(db, user_id, new_birth_date)
    if (not user) or user == "failed" or user == "fail":
        return {"status": "error", "message": "User not found"}
    
    return {"status": "success", "message": f"Đã cập nhật ngày-tháng-năm sinh thành {new_birth_date}"}
