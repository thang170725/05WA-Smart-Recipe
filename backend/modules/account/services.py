import logging
logger = logging.getLogger(__name__)

#
# 
#
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.account import repositories
from backend.modules.user.models import User, OTP
from backend.core.security import hash_password, verify_password
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
import uuid
import shutil
from fastapi import HTTPException, status
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
from datetime import datetime, timedelta, timezone
load_dotenv()
EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", default="Empty")
if GOOGLE_CLIENT_ID == "Empty":
    raise ValueError("Lỗi lấy Google client id")

from backend.modules.account import repositories

#
#
#
async def register_service(db: AsyncSession, data: dict):
    try:
        data["role"] = "user"
        data["password"] = hash_password(data["password"])
        
        new_user = await repositories.register_repository(data)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user
    except Exception as e:
        db.rollback()
        raise

# LOGIN SERVICE
async def login_service(db: AsyncSession, payload):
    try:
        user = await repositories.get_by_email_repository(
            db,
            payload["email"]
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username or password is not correct"
            )

        if not verify_password(
            payload["password"],
            user.password
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username or password is not correct"
            )

        return user

    except HTTPException:
        raise

    except Exception as e:
        logger.exception("Lỗi login: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

async def check_email_service(db, email: str):
    try:
        response = await repositories.check_email_repository(db, email)
        return response
    except:
        logger.exception("check email failed!")     

# class AccountService:
#     def __init__(self):
#         self.repo = AccountRepository()
    
    
    
    
    
#     def authenticate_google(self, db: Session, token: str):
#         try:
#             idinfo = id_token.verify_oauth2_token(
#                 token,
#                 requests.Request(),
#                 GOOGLE_CLIENT_ID
#             )
#         except ValueError:
#             return None

#         google_id = idinfo["sub"]
#         email = idinfo["email"]
#         name = idinfo.get("name")

#         # 1️⃣ Kiểm tra google_id trước
#         user = self.repo.get_by_google_id(db, google_id)
#         if user:
#             return user

#         # 2️⃣ Nếu email đã tồn tại (đã đăng ký bằng password)
#         user = self.repo.get_by_email(db, email)
#         if user:
#             user.google_id = google_id
#             db.commit()
#             db.refresh(user)
#             return user

#         # 3️⃣ Nếu chưa tồn tại → tạo mới
#         new_user = {
#             "email": email,
#             "password": None,
#             "google_id": google_id,
#             "role": "user"
#         }

#         return self.repo.create_account(db, new_user)

#     def _send_email(self, to_email: str, otp: str):
#         msg = MIMEMultipart()
#         msg["From"] = EMAIL
#         msg["To"] = to_email
#         msg["Subject"] = "OTP Reset Password"

#         body = f"Your OTP is: {otp}"
#         msg.attach(MIMEText(body, "plain"))

#         server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
#         server.starttls()
#         server.login(EMAIL, PASSWORD)
#         server.send_message(msg)
#         server.quit()

#     def _generate_otp(self):
#         return str(random.randint(100000, 999999))

#     def forgot_password_service(self, db: Session, email):
#         try:
#             # 1. genarate otp random
#             generate_otp = self._generate_otp()

#             # 2. insert otp table
#             otp = self.repo.insert_otp_repo(db, email, generate_otp)
#             db.commit()

#             # 3. send otp to email
#             self._send_email(email, otp.otp) # gủi otp đến email
#         except Exception as e:
#             db.rollback()
#             raise ValueError(e)

#     # xác thực otp
#     def verity_otp_service(self, db: Session, email, otp: str):
#         try:
#             record = self.repo.verify_otp_repo(db, email, otp)

#             # tránh crash chương trình
#             if not record:
#                 raise HTTPException(status_code=400, detail="OTP invalid")

#             expires_at = record.expires_at.replace(tzinfo=timezone.utc)
#             if expires_at < datetime.now(timezone.utc):
#                 raise HTTPException(status_code=400, detail="OTP expired")

#             record.is_used = True
#             db.commit()

#             return True
#         except Exception as e:
#             db.rollback()
#             raise ValueError(e)
    
#     # reset user bằng email
#     def reset_password_service(self, db: Session, email: str, new_password: str):
#         try:
#             now = datetime.now(timezone.utc)

#             otp_record = db.query(OTP).filter(
#                 OTP.email == email,
#                 OTP.is_used == True,
#             ).order_by(OTP.expires_at.desc()).first()

#             if not otp_record:
#                 raise HTTPException(status_code=400, detail="OTP not verified")
#             if not otp_record:
#                 raise HTTPException(400, "OTP not verified")

#             expires_at = otp_record.expires_at.replace(tzinfo=timezone.utc)

#             if expires_at < now:
#                 raise HTTPException(400, "OTP expired")

#             user = self.user_service.get_user_by_email_service(db, email)

#             if not user:
#                 raise HTTPException(status_code=404, detail="User not found")

#             user.password = hash_password(new_password)

#             db.commit()

#             return {"message": "Password updated"}
#         except Exception as e:
#             db.rollback()
#             raise ValueError(e)


