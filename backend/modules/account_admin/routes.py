import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from backend.config.database import get_db
from backend.modules.account import services
from backend.core.security import create_access_token
from backend.modules.user.schemas import (
    InputSendEmailSchema,
    InputVerifyOtpSchema,
    InputResetPasswordSchema
)
from backend.modules.account_admin import schemas
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/admin", tags=["Account Admin"])

# ========================================
# ============ chức năng đăng ký =========
# ========================================
# API để check email tồn tại hay chưa. mỗi email chỉ được có 1 tài khoản
@router.get('/check-email')
async def check_email(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    '''
    API check email
    '''
    return await services.check_email_service(db, email)

#
# ======== POST ========
#
# API để đăng ký tài khoản
@router.post('/register')
async def register(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    logger.debug(payload)
    user =  await services.register_service(db, payload)
    return user

# API để đăng nhập bằng tài khoản admin
@router.post('/login')
async def login(
    payload: schemas.InputLoginSchema,
    db: AsyncSession = Depends(get_db)
):
    logger.debug(payload)
    user = await services.login_service(db, payload)
    logger.debug(user)
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# LOGIN AS GOOGLE CLIENT 
@router.post("/login/google")
async def login_google(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    user = await services.authenticate_google(db, payload["token"])

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# LOGIN AS GOOGLE CLIENT 
@router.post("/login/google")
async def login_google(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    user = await services.authenticate_google(db, payload["token"])

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


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
def reset_password(
    payload: InputResetPasswordSchema,
    db: AsyncSession = Depends(get_db) 
):
    return services.reset_password_service(db, payload.email, payload.new_password)