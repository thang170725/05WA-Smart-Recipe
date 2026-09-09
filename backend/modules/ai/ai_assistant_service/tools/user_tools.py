"""
Định nghĩa Tools dạng LangChain `@tool` + Pydantic args_schema.

Kiến trúc tách 2 lớp:
  1) SCHEMA / @tool  → mô tả cho LLM (bind_tools) và cho Vector DB (RAG)
  2) EXECUTOR async  → hàm Python thật gọi service/DB (chạy ở node Tool Execution)

Lý do tách: Tool cần `db` + `user_id` từ runtime context, không đưa vào args
mà LLM điền — tránh lộ/nhầm ID và giữ schema gọn cho function calling.
"""

from __future__ import annotations

#
#
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
#
#
from typing import Literal, Optional

from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.user import services


# =============================================================================
# 1. PYDANTIC ARGS SCHEMAS — mô tả tham số chi tiết cho từng Tool
# =============================================================================
class GetUserInfoInput(BaseModel):
    """Không cần tham số — lấy theo user đang đăng nhập."""


class GetUserEmailInput(BaseModel):
    """Không cần tham số — lấy email theo user đang đăng nhập."""


class GetUserFullnameInput(BaseModel):
    """Không cần tham số — lấy họ tên theo user đang đăng nhập."""


class GetUserPhoneInput(BaseModel):
    """Không cần tham số — lấy SĐT theo user đang đăng nhập."""


class GetUserBirthDateInput(BaseModel):
    """Không cần tham số — lấy ngày sinh theo user đang đăng nhập."""


class GetUserAddressInput(BaseModel):
    """Không cần tham số — lấy địa chỉ theo user đang đăng nhập."""


class UpdateAddressInput(BaseModel):
    new_address: str = Field(
        description="Địa chỉ mới cần cập nhật. Ví dụ: 'Hoài Đức, Hà Nội' hoặc 'Đà Nẵng'."
    )


class UpdateBirthDateInput(BaseModel):
    new_birth_date: str = Field(
        description=(
            "Ngày sinh mới, BẮT BUỘC định dạng YYYY-MM-DD. "
            "Ví dụ user nói '12 tháng 3 năm 2000' → chuyển thành '2000-03-12'."
        )
    )


class UpdateGenderInput(BaseModel):
    new_gender: Literal["male", "female", "other"] = Field(
        description="Giới tính mới. Chỉ nhận: 'male' | 'female' | 'other'."
    )


class UpdateFitnessGoalInput(BaseModel):
    activity_level: Optional[
        Literal["sedentary", "light", "moderate", "active", "very_active"]
    ] = Field(
        default=None,
        description=(
            "Mức độ hoạt động thể chất mới (optional). "
            "sedentary=ít vận động, light=nhẹ, moderate=vừa, active=năng động, very_active=cao."
        ),
    )
    target_goal: Optional[
        Literal["lose_weight", "gain_muscle", "maintenance"]
    ] = Field(
        default=None,
        description=(
            "Mục tiêu vóc dáng mới (optional). "
            "lose_weight=giảm cân, gain_muscle=tăng cơ, maintenance=duy trì."
        ),
    )


# =============================================================================
# 2. LANGCHAIN @tool — dùng để bind vào LLM + index vào Vector DB
#    Thân hàm chỉ là stub; thực thi thật nằm ở EXECUTORS bên dưới.
# =============================================================================

@tool("get_user_info", args_schema=GetUserInfoInput)
def get_user_info() -> str:
    """
    Lấy toàn bộ thông tin cá nhân / hồ sơ tài khoản của người dùng hiện tại.

    Dùng khi người dùng muốn:
    - xem thông tin tài khoản
    - xem hồ sơ cá nhân
    - xem thông tin cá nhân của mình
    - biết tài khoản của tôi có những thông tin gì
    - xem toàn bộ thông tin tôi đã đăng ký

    Thông tin có thể bao gồm:
    email, tên đầy đủ, địa chỉ, số điện thoại, ngày sinh, 
    giới tính, chiều cao, cân nặng và mục tiêu.
    """
    raise NotImplementedError("Executed via ToolExecutor")


@tool("get_user_email", args_schema=GetUserEmailInput)
def get_user_email() -> str:
    """
    Lấy địa chỉ email của người dùng hiện tại.

    Dùng khi người dùng muốn:
    - xem email của mình
    - biết email tài khoản
    - lấy địa chỉ email đã đăng ký
    """
    raise NotImplementedError("Executed via ToolExecutor")


@tool("get_user_fullname", args_schema=GetUserFullnameInput)
def get_user_fullname() -> str:
    """
    Lấy họ và tên đầy đủ của người dùng hiện tại.

    Dùng khi người dùng muốn:
    - xem tên của mình
    - biết họ tên tài khoản
    - lấy tên đầy đủ đã đăng ký
    """
    raise NotImplementedError("Executed via ToolExecutor")


@tool("get_user_phone", args_schema=GetUserPhoneInput)
def get_user_phone() -> str:
    """
    Lấy số điện thoại của người dùng hiện tại.

    Dùng khi người dùng muốn:
    - xem số điện thoại của mình
    - biết số điện thoại tài khoản
    - lấy số điện thoại đã đăng ký
    """
    raise NotImplementedError("Executed via ToolExecutor")


@tool("get_user_birth_date", args_schema=GetUserBirthDateInput)
def get_user_birth_date() -> str:
    """
    Lấy ngày sinh của người dùng hiện tại.

    Dùng khi người dùng muốn:
    - xem ngày sinh của mình
    - muốn biết ngày sinh đã đăng ký trên tài khoản 
    """
    raise NotImplementedError("Executed via ToolExecutor")


@tool("get_user_address", args_schema=GetUserAddressInput)
def get_user_address() -> str:
    """
    Lấy địa chỉ của người dùng hiện tại

    Dùng khi người dùng muốn:
    - xem địa chỉ của mình
    - muốn biết địa chỉ của mình đã đăng ký ở tài khoản
    """
    raise NotImplementedError("Executed via ToolExecutor")


@tool("update_address", args_schema=UpdateAddressInput)
def update_address(new_address: str) -> str:
    """
    Chỉ dùng để CẬP NHẬT / ĐỔI địa chỉ nơi ở của người dùng sang địa chỉ mới.
    Yêu cầu user phải nêu rõ địa chỉ mới. Thao tác ghi — cần xác nhận trước khi lưu.
    """
    raise NotImplementedError("Executed via ToolExecutor")


@tool("update_birth_date", args_schema=UpdateBirthDateInput)
def update_birth_date(new_birth_date: str) -> str:
    """
    Chỉ dùng để CẬP NHẬT ngày sinh của người dùng.
    Tham số phải là YYYY-MM-DD. Thao tác ghi — cần xác nhận trước khi lưu.
    """
    raise NotImplementedError("Executed via ToolExecutor")


# =============================================================================
# 3. EXECUTORS — hàm async thật gọi sang user services
# =============================================================================

async def _exec_get_user_info(db: AsyncSession, user_id: int, **_kwargs):
    data = await services.get_info_user_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy thông tin người dùng."}
    return {"status": "success", "data": data}


async def _exec_get_user_email(db: AsyncSession, user_id: int, **_kwargs):
    data = await services.get_email_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy email."}
    return {"status": "success", "data": data}


async def _exec_get_user_fullname(db: AsyncSession, user_id: int, **_kwargs):
    data = await services.get_fullname_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy họ tên."}
    return {"status": "success", "data": data}


async def _exec_get_user_phone(db: AsyncSession, user_id: int, **_kwargs):
    data = await services.get_phone_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy số điện thoại."}
    return {"status": "success", "data": data}


async def _exec_get_user_birth_date(db: AsyncSession, user_id: int, **_kwargs):
    data = await services.get_birth_date_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy ngày sinh."}
    return {"status": "success", "data": data}


async def _exec_get_user_address(db: AsyncSession, user_id: int, **_kwargs):
    data = await services.get_address_service(db, user_id)
    if not data:
        return {"status": "error", "message": "Không tìm thấy địa chỉ."}
    return {"status": "success", "data": data}


async def _exec_update_address(db: AsyncSession, user_id: int, new_address: str, **_kwargs):
    result = await services.update_address_service(db, user_id, new_address)
    if result != "successed":
        return {"status": "error", "message": "Cập nhật địa chỉ thất bại."}
    return {
        "status": "success",
        "message": f"Đã cập nhật địa chỉ thành {new_address}",
    }


async def _exec_update_birth_date(
    db: AsyncSession, user_id: int, new_birth_date: str, **_kwargs
):
    result = await services.update_birth_date_service(db, user_id, new_birth_date)
    if not result or result in ("failed", "fail"):
        return {"status": "error", "message": "Cập nhật ngày sinh thất bại."}
    return {
        "status": "success",
        "message": f"Đã cập nhật ngày sinh thành {new_birth_date}",
    }


# Map tên tool (đúng với @tool name) → executor async
USER_TOOL_EXECUTORS = {
    "get_user_info": _exec_get_user_info,
    "get_user_email": _exec_get_user_email,
    "get_user_fullname": _exec_get_user_fullname,
    "get_user_phone": _exec_get_user_phone,
    "get_user_birth_date": _exec_get_user_birth_date,
    "get_user_address": _exec_get_user_address,
    "update_address": _exec_update_address,
    "update_birth_date": _exec_update_birth_date,
}

# Danh sách BaseTool để bind / sync embedding
USER_TOOLS = [
    get_user_info,
    get_user_email,
    get_user_fullname,
    get_user_phone,
    get_user_birth_date,
    get_user_address,
    update_address,
    update_birth_date,
]

# Tool ghi dữ liệu — cần xác nhận user trước khi execute thật
USER_WRITE_TOOL_NAMES = {
    "update_address",
    "update_birth_date",
}
