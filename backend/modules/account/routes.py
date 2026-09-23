#
# ======= nơi setup logging =====
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
# ======= nơi import thư viện =====
#
from backend.config.database import get_db
from backend.modules.account import services
from backend.core.security import create_access_token, create_registration_token, verify_registration_token
from backend.modules.user.schemas import (
    InputSendEmailSchema,
    InputVerifyOtpSchema,
    InputResetPasswordSchema
)
from backend.modules.account.schemas import GoogleCompleteRegister
from backend.modules.account import repositories

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/account", tags=["Account"])

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

# API để đăng ký tài khoản
@router.post('/register')
async def register(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    logger.debug(payload)
    user =  await services.register_service(db, payload)
    return user

# API để đăng nhập tài khoản
@router.post('/login')
async def login(
    payload: dict,
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
async def login_google(payload: dict, db: AsyncSession = Depends(get_db)):
    result = await services.authenticate_google(db, payload["token"])

    if result["status"] == "login":
        user = result["user"]
        access_token = create_access_token(data={"sub": str(user.id)})
        return {
            "status": "login",
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

    # status == "need_register"
    registration_token = create_registration_token(
        result["google_id"], result["email"], result["name"]
    )
    return {
        "status": "need_register",
        "registration_token": registration_token,
        "email": result["email"],
        "name": result["name"],
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

@router.post("/register/google/complete")
async def complete_google_register(
    payload: GoogleCompleteRegister,
    db: AsyncSession = Depends(get_db)
):
    token_data = verify_registration_token(payload.registration_token)

    # phòng trường hợp user bấm đăng ký 2 lần / email đã được tạo lúc chờ
    existing = await repositories.get_by_email_repository(db, token_data["email"])
    if existing:
        raise HTTPException(status_code=409, detail="Email đã được đăng ký")

    new_user = {
        "email": token_data["email"],
        "google_id": token_data["google_id"],
        "password": None,
        "role": "user",
        "fullname": payload.fullname,
        "birth_date": payload.birth_date,
        "phone": payload.phone,
        "gender": payload.gender,
        "address": payload.address,
        "current_height": payload.current_height,
        "current_weight": payload.current_weight,
    }

    user = await repositories.create_account(db, new_user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }