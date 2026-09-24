import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

import os
import uuid
import shutil
import smtplib
import random

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
load_dotenv()
from fastapi import HTTPException, status
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone

from backend.modules.account import repositories
from backend.modules.user.models import User, OTP
from backend.core.security import PasswordSecurity

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", default="Empty")
if GOOGLE_CLIENT_ID == "Empty":
    raise ValueError("Lỗi lấy Google client id")

from backend.modules.account import repositories

async def register_service(db: AsyncSession, data: dict):
    try:
        ps = PasswordSecurity()

        data["role"] = "user"
        data["password"] = ps.hash_password(data["password"])
        
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
        ps = PasswordSecurity()

        user = await repositories.get_by_email_repository(
            db,
            payload["email"]
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username or password is not correct"
            )

        if not ps.verify_password(
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

async def authenticate_google(db: AsyncSession, token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = idinfo["sub"]
    email = idinfo["email"]
    name = idinfo.get("name")

    # 1️⃣ Đã liên kết Google trước đó
    user = await repositories.get_by_google_id(db, google_id)
    if user:
        return {"status": "login", "user": user}

    # 2️⃣ Email đã có (đăng ký bằng password trước đó) → liên kết thêm google_id
    user = await repositories.get_by_email_repository(db, email)
    if user:
        user.google_id = google_id
        await db.commit()
        await db.refresh(user)
        return {"status": "login", "user": user}

    # 3️⃣ Chưa tồn tại → KHÔNG tạo user, trả thông tin để FE hỏi thêm
    return {
        "status": "need_register",
        "google_id": google_id,
        "email": email,
        "name": name,
    }

async def send_email( to_email: str, otp: str ): 
    try: 
        msg = MIMEMultipart()
        msg["From"] = EMAIL 
        msg["To"] = to_email 
        msg["Subject"] = "OTP Reset Password" 
        body = f"Your OTP is: {otp}" 
        msg.attach( MIMEText(body, "plain") ) 
        server = smtplib.SMTP( SMTP_SERVER, SMTP_PORT ) 
        server.starttls() 
        server.login( EMAIL, PASSWORD ) 
        server.send_message(msg)
        server.quit() 
    except Exception as e: 
        raise ValueError(e) 

async def generate_otp(): 
    try: 
        return str( random.randint( 100000, 999999 ) ) 
    except Exception as e: 
        raise ValueError(e) 

async def forgot_password_service( db: AsyncSession, email ): 
    try: 
        # 1. genarate otp random 
        generate_otp = await generate_otp() 
        
        # 2. insert otp table 
        otp = await repositories.insert_otp_repo( db, email, generate_otp ) 
        await db.commit() 
        
        # 3. send otp to email 
        await send_email( email, otp.otp ) 
        
        # gủi otp đến email 
        
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

# xác thực otp 
async def verity_otp_service( db: AsyncSession, email, otp: str ): 
    try: 
        record = await repositories.verify_otp_repo( db, email, otp ) 
        
        # tránh crash chương trình 
        if not record: 
            raise HTTPException( status_code=400, detail="OTP invalid" ) 
        expires_at = record.expires_at.replace( tzinfo=timezone.utc ) 
        
        if expires_at < datetime.now(timezone.utc): 
            raise HTTPException( status_code=400, detail="OTP expired" ) 
        
        record.is_used = True 
        await db.commit() 
        
        return True 

    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

# reset user bằng email 
async def reset_password_service( db: AsyncSession, email: str, new_password: str ): 
    try: 
        ps = PasswordSecurity()

        now = datetime.now(timezone.utc) 
        result = await db.execute( 
            select(OTP).where( OTP.email == email, OTP.is_used == True, ) .order_by( OTP.expires_at.desc() ) ) 
        
        otp_record = result.scalars().first() 
        if not otp_record: 
            raise HTTPException( status_code=400, detail="OTP not verified" ) 
        if not otp_record: 
            raise HTTPException( 400, "OTP not verified" ) 
        expires_at = otp_record.expires_at.replace( tzinfo=timezone.utc ) 
        if expires_at < now: 
            raise HTTPException( 400, "OTP expired" ) 
        user = await repositories.get_user_by_email_repo( db, email ) 
        if not user: 
            raise HTTPException( status_code=404, detail="User not found" ) 
        user.password = ps.hash_password( new_password ) 
        
        await db.commit() 
        return { "message": "Password updated" } 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e)
