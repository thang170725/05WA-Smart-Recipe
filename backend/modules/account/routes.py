from backend.config.database import get_db
from backend.modules.account import services

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/account", tags=["Account"])

# ========================================
# ============ chức năng đăng ký =========
# ========================================
@router.get('/check-email')
async def check_email(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    '''
    API check email
    '''
    return await services.check_email_service(db, email)

# @router.post('/register', response_model=OutputRegisterSchema)
# async def register(
#     payload: InputRegisterSchema,
#     db: Session = Depends(get_db)
# ):
#     result = account_service.register(db, payload.model_dump(exclude_unset=True))
#     return {"status": "success" if result else "failed"}

# # LOGIN
# @router.post('/login')
# async def login(
#     payload: InputLoginSchema,
#     db: Session = Depends(get_db)
# ):
#     user = account_service.login(db, payload.username, payload.password)
    
#     access_token = create_access_token(
#         data={"sub": str(user.id)}
#     )

#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user": user
#     }

# # LOGIN AS GOOGLE CLIENT 
# @router.post("/login/google")
# async def login_google(
#     payload: dict,
#     db: Session = Depends(get_db)
# ):
#     user = account_service.authenticate_google(db, payload["token"])

#     if not user:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid Google token"
#         )

#     access_token = create_access_token(
#         data={"sub": str(user.id)}
#     )

#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user": user
#     }

# # =======================================
# # ===== PROFILE API =====
# # =======================================
# # lấy profile 
# @router.get("/get-profile", response_model=OutputProfileUserSchema)
# async def get_profile(current_user = Depends(get_current_user)):
#     return current_user

# # lấy profile + weight, height
# @router.get("/get-all-profile")
# async def get_profile(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     return user_service.get_info_user_service(db, current_user.id)

# # cập nhật prfile cơ bản
# @router.put('/update-profile')
# def update_profile(
#     payload: InputUpdateProfileSchema,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ): 
#     return user_service.update_profile_service(
#         db, 
#         current_user.id, 
#         payload)

# @router.post("/upload-avatar")
# async def upload_avatar(
#     avatar_url: UploadFile = File(...),
#     current_user: User = Depends(get_current_user), 
#     db: Session = Depends(get_db)
# ):
#     avatar_url = user_service.upload_avatar(
#         db=db,
#         user_id=current_user.id,
#         file=avatar_url,
#         avatars_path=avatars_path
#     )

#     return {
#         "avatar_url": avatar_url
#     }

# # =======================================
# # ===== POST / PUT / INSERT / UPDATE =====
# # =======================================

# # UPDATE PASSWORD
# @router.put("/update-password")
# def update_password(
#     payload: InputUpdatePasswordSchema,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     user_service.update_password(db, current_user, payload.password)
#     return {"message": "Password updated"}

# # ===========================
# # ===== FORGOT PASSWORD =====
# # ===========================
# @router.post("/send-email")
# def send_email(
#     payload: InputSendEmailSchema,
#     db: Session = Depends(get_db)
# ):
#     account_service.forgot_password_service(db, payload.email)
#     return {"message": "OTP sent"}

# # xác thực otp
# @router.post("/verify-otp")
# def verify_email(
#     payload: InputVerifyOtpSchema,
#     db: Session = Depends(get_db)
# ):
#     return account_service.verity_otp_service(
#         db, payload.email, payload.otp)

# # reset password
# @router.post("/reset-password")
# def reset_password(
#     payload: InputResetPasswordSchema,
#     db: Session = Depends(get_db) 
# ):
#     return account_service.reset_password_service(db, payload.email, payload.new_password)