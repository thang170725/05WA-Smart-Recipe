from sqlalchemy.orm import Session
from backend.modules.user.repositories import UserRepository, AccountRepository
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

class AccountService:
    def __init__(self):
        self.repo = AccountRepository()
    
    def register(self, db: Session, data: dict):
        data["role"] = "user"
        data["password"] = hash_password(data["password"])
        
        return self.repo.create_account(db, data)
    
    def login(self, db: Session, email: str, password: str):
        user = self.repo.get_by_email(email, db)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username or password is not correct",
            )
        if not verify_password(password, user.password):
            return None

        return user
    
    def authenticate_google(self, db: Session, token: str):
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                GOOGLE_CLIENT_ID
            )
        except ValueError:
            return None

        google_id = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name")

        # 1️⃣ Kiểm tra google_id trước
        user = self.repo.get_by_google_id(db, google_id)
        if user:
            return user

        # 2️⃣ Nếu email đã tồn tại (đã đăng ký bằng password)
        user = self.repo.get_by_email(db, email)
        if user:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
            return user

        # 3️⃣ Nếu chưa tồn tại → tạo mới
        new_user = {
            "email": email,
            "password": None,
            "google_id": google_id,
            "role": "user"
        }

        return self.repo.create_account(db, new_user)

    def send_email(self, to_email: str, otp: str):
        msg = MIMEMultipart()
        msg["From"] = EMAIL
        msg["To"] = to_email
        msg["Subject"] = "OTP Reset Password"

        body = f"Your OTP is: {otp}"
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)
        server.quit()

    def generate_otp(self):
        return str(random.randint(100000, 999999))

    def forgot_password(self, email, db: Session):
        # gen otp
        otp = self.generate_otp()

        otp_record = OTP(
            email=email,
            otp=otp,
            expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).replace(tzinfo=None),
            is_used=False
        )

        db.add(otp_record)

        db.commit()

        self.send_email(email, otp) # gủi otp đến email

    def verity_otp_service(self, email, otp: str, db: Session):
        record = self.repo.verify_otp_repo(email, otp, db)

        # tránh crash chương trình
        if not record:
            raise HTTPException(status_code=400, detail="OTP invalid")
        
        expires_at = record.expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="OTP expired")

        record.is_used = True
        db.commit()

        return {"message": "OTP valid"}
    
    # reset user bằng email
    def reset_password_service(self, email: str, new_password: str, db: Session):
        now = datetime.now(timezone.utc)

        otp_record = db.query(OTP).filter(
            OTP.email == email,
            OTP.is_used == True,
        ).order_by(OTP.expires_at.desc()).first()

        if not otp_record:
            raise HTTPException(status_code=400, detail="OTP not verified")
        if not otp_record:
            raise HTTPException(400, "OTP not verified")

        expires_at = otp_record.expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            raise HTTPException(400, "OTP expired")

        user = self.repo.get_by_email(email, db)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.password = hash_password(new_password)

        db.commit()

        return {"message": "Password updated"}

class UserService:
    def __init__(self):
        self.repo = UserRepository()

    # ==================
    # ====== GET =======
    # ==================
    def get_profile(self, db: Session, user_id: int):
        return self.repo.get_by_id(db, user_id)

    def get_address(self, db: Session, user_id: int):
        user = self.repo.get_by_id(db, user_id)
        return user.address if user else None

    def get_email(self, db: Session, user_id: int):
        user = self.repo.get_by_id(db, user_id)
        return user.username if user else None

    def get_info_user_service(self, db, user_id):
        return self.repo.get_info_user_repo(db, user_id)

    # lấy email
    def get_email_service(self, db: Session, user_id: int):
        return self.repo.get_email_repo(db, user_id)

    # lấy address
    def get_address_service(self, db: Session, user_id: int):
        return self.repo.get_address_repo(db, user_id)
    
    # lấy phone
    def get_phone_service(self, db: Session, user_id: int):
        return self.repo.get_phone_repo(db, user_id)
    
    # lấy birth date
    def get_birth_date_service(self, db: Session, user_id: int):
        return self.repo.get_birth_date_repo(db, user_id)

    def get_fullname_service(self, db, user_id):
        return self.repo.get_fullname_repo(db, user_id)
    
    # ========================
    # ======= UPDATE =========
    # ========================
    def update_profile(self, db: Session, user: User, data: dict):
        return self.repo.update_user(db, user, data)

    def update_password(self, db: Session, user: User, password: str):
        hashed_password = hash_password(password)
        self.repo.update_password(db, user, hashed_password)
     
    def upload_avatar(self, db, user_id: int, file, avatars_path: str):

        # 1️⃣ Validate
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be image")

        # 2️⃣ Tạo tên file
        file_ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{file_ext}"

        # 3️⃣ Lưu file vật lý
        file_path = os.path.join(avatars_path, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 4️⃣ Tạo URL tương đối
        relative_url = f"/avatars/{unique_name}"

        # 5️⃣ Gọi repo update DB
        updated_user = self.repo.update_avatar(db, user_id, relative_url)

        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")

        return relative_url

    # cập nhật địa chỉ
    def update_address_service(self, db: Session, user_id, new_address: str):
        try:
            user =  self.repo.update_address_repo(db, user_id, new_address)
            if not user:
                return "not_found"
            
            db.commit()
            db.refresh(user)
            return "successed"
        except Exception as e:
            db.rollback()
            print("ERROR: ", e)
            return "failed"

    # cập nhật ngày tháng năm sinh
    def update_birth_date_service(self, db: Session, user_id, new_birth_date: str):
        try:
            user = self.repo.update_birth_date_repo(db, user_id, new_birth_date)
            if not user:
                return None
            
            db.commit()
            db.refresh(user)
            return "updated"
        except Exception as e:
            db.rollback()
            raise ValueError("update_birth_date_service: ", {e})
