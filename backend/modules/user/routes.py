from backend.modules.user.schemas import ( 
    InputRegisterSchema,
    OutputRegisterSchema,
    InputLoginSchema,
    OutputProfileUserSchema,
    IOUpdateProfileSchema,
    InputUpdatePasswordSchema,
    InputSendEmailSchema,
    InputVerifyEmailSchema,
    InputResetPasswordSchema
)
from backend.modules.user.models import User
from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db
from backend.core.security import create_access_token
from backend.modules.user.services import UserService, AccountService
from backend.config.settings import avatars_path
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

router = APIRouter(prefix="/user", tags=["User"])
account_service = AccountService()
user_service = UserService()

# REGISTER
@router.post('/register', response_model=OutputRegisterSchema)
async def register(
    payload: InputRegisterSchema,
    db: Session = Depends(get_db)
):
    result = account_service.register(db, payload.model_dump(exclude_unset=True))
    return {"status": "success" if result else "failed"}

# LOGIN
@router.post('/login')
async def login(
    payload: InputLoginSchema,
    db: Session = Depends(get_db)
):
    user = account_service.login(db, payload.username, payload.password)
    
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
    db: Session = Depends(get_db)
):
    user = account_service.authenticate_google(db, payload["token"])

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

# ======== PROFILE =========
# ===== GET ====== 
@router.get("/get-profile", response_model=OutputProfileUserSchema)
async def get_profile(current_user = Depends(get_current_user)):
    return current_user

@router.post("/upload-avatar")
async def upload_avatar(
    avatar_url: UploadFile = File(...),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    avatar_url = user_service.upload_avatar(
        db=db,
        user_id=current_user.id,
        file=avatar_url,
        avatars_path=avatars_path
    )

    return {
        "avatar_url": avatar_url
    }
    
# UPDATE PROFILE 
@router.put('/update-profile', response_model=IOUpdateProfileSchema)
def update_profile(
    payload: IOUpdateProfileSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
): 
    return user_service.update_profile(db, current_user, payload.model_dump(exclude_unset=True))

# UPDATE PASSWORD
@router.put("/update-password")
def update_password(
    payload: InputUpdatePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_service.update_password(db, current_user, payload.password)
    return {"message": "Password updated"}

# ===== FORGOT PASSWORD =====
@router.post("/send-email")
def send_email(
    payload: InputSendEmailSchema,
    db: Session = Depends(get_db)
):
    account_service.forgot_password(payload.email, db)
    return {"message": "OTP sent"}

@router.post("/verify-email")
def verify_email(
    payload: InputVerifyEmailSchema,
    db: Session = Depends(get_db)
):
    return account_service.verity_otp_service(payload.email, payload.otp, db)

@router.post("/reset-password")
def reset_password(
    payload: InputResetPasswordSchema,
    db: Session = Depends(get_db) 
):
    return account_service.reset_password_service(payload.email, payload.new_password, db)