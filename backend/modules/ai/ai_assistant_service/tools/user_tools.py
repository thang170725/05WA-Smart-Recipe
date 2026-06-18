# backend/modules/ai/tools/user_tools.py
from pydantic import BaseModel, Field
from typing import Literal
from backend.modules.user.services import UserService # Import Repo của bạn
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

class UpdateAddressInput(BaseModel):
    """Cập nhật hoặc thay đổi địa chỉ nơi ở của người dùng sang địa chỉ mới."""
    new_address: str = Field(description="Địa chỉ mới cần cập nhật. Ví dụ: Đà Nẵng, Hà Nội")

class UpdateGenderInput(BaseModel):
    """Cập nhật hoặc thay đổi giới tính của người dùng."""
    new_gender: Literal['male', 'female', 'other'] = Field(
        description="Giới tính mới của người dùng. Bắt buộc phải là một trong ba giá trị: 'male', 'female', hoặc 'other'."
    )

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
    # Dùng hàm có sẵn của bạn: get_info_user
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


# --- Thực thi Cập nhật địa chỉ ---
# async def execute_update_address(db: Session, user_id: int, new_address: str):
#     # 1. Gọi hàm update_address_repo của bạn để thay đổi trường address của đối tượng user
#     user = user_repo.update_address_repo(db, user_id, new_address)
#     if not user:
#         return {"status": "error", "message": "User not found"}
    
#     # 2. Bạn đã viết hàm update_user có lệnh commit/refresh sẵn, tận dụng nó luôn để lưu vào DB
#     user_repo.update_user(db, user, {"address": new_address})
#     return {"status": "success", "message": f"Đã cập nhật địa chỉ thành {new_address}"}


# # --- Thêm chức năng test: Thực thi Cập nhật các chỉ số sức khỏe khác ---
# async def execute_update_fitness_goal(db: Session, user_id: int, activity_level: str = None, target_goal: str = None):
#     user = user_repo.get_by_id(db, user_id)
#     if not user:
#         return {"status": "error", "message": "User not found"}
    
#     update_data = {}
#     if activity_level:
#         update_data["activity_level"] = activity_level
#     if target_goal:
#         update_data["target_goal"] = target_goal
        
#     # Gọi hàm cập nhật tổng quát có commit của bạn
#     user_repo.update_user(db, user, update_data)
#     return {"status": "success", "message": "Đã cập nhật chỉ số thể chất thành công."}