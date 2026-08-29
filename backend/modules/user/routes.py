#
# ===== nơi setup logging ====
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

# 
# ===== nơi import thư viện =====
# 
from backend.modules.user.schemas import ( 
    OutputProfileUserSchema,
    InputUpdateProfileSchema,
    InputUpdatePasswordSchema,
    InputSendEmailSchema,
    InputVerifyOtpSchema,
    InputResetPasswordSchema
)
from backend.modules.user.models import User
from backend.modules.account.dependencies import get_current_user
from backend.config.database import get_db
from backend.core.security import create_access_token
from backend.modules.user import services
from backend.config.settings import avatars_path

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/user", tags=["User"])

#
# ======= API về user ========
#
# lấy profile 
@router.get("/get-profile", response_model=OutputProfileUserSchema)
async def get_profile(current_user = Depends(get_current_user)):
    return current_user

# lấy profile + weight, height
@router.get("/get-all-profile")
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = await services.get_info_user_service(db, current_user.id)
    return user

# cập nhật prfile cơ bản
@router.put('/update-profile')
async def update_profile(
    payload: InputUpdateProfileSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
): 
    user = await services.update_profile_service(
        db, 
        current_user.id, 
        payload
    )
    return user

@router.post("/upload-avatar")
async def upload_avatar(
    avatar_url: UploadFile = File(...),
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    avatar_url = await services.upload_avatar(
        db=db,
        user_id=current_user.id,
        file=avatar_url,
        avatars_path=avatars_path
    )

    return {
        "avatar_url": avatar_url
    }

# =======================================
# ===== POST / PUT / INSERT / UPDATE =====
# =======================================

# UPDATE PASSWORD
@router.put("/update-password")
async def update_password(
    payload: InputUpdatePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await services.update_password(db, current_user, payload.password)
    return {"message": "Password updated"}

# ===========================
# ===== FORGOT PASSWORD =====
# ===========================
@router.post("/send-email")
async def send_email(
    payload: InputSendEmailSchema,
    db: AsyncSession = Depends(get_db)
):
    await services.forgot_password_service(db, payload.email)
    return {"message": "OTP sent"}

# xác thực otp
@router.post("/verify-otp")
async def verify_email(
    payload: InputVerifyOtpSchema,
    db: AsyncSession = Depends(get_db)
):
    return await services.verity_otp_service(
        db, payload.email, payload.otp)

# reset password
@router.post("/reset-password")
async def reset_password(
    payload: InputResetPasswordSchema,
    db: AsyncSession = Depends(get_db) 
):
    return await services.reset_password_service(db, payload.email, payload.new_password)