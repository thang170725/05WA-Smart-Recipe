from sqlalchemy.orm import Session
from backend.modules.user.models import User, OTP
from datetime import datetime, timezone
from sqlalchemy import select

class AccountRepository:
    def create_account(self, db: Session, data: dict) -> User:
        new_user = User(**data)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    def get_by_email(self, email: str, db: Session) -> User | None:
        return db.query(User).filter(User.email == email).first()
    
    def get_by_google_id(self, db: Session, google_id: str) -> User | None:
        return db.query(User).filter(User.google_id == google_id).first()
    
    def verify_otp_repo(self, email:str, otp: str, db: Session):
        record = db.query(OTP).filter(
            OTP.email == email,
            OTP.otp == otp,
            OTP.is_used == False,
            OTP.expires_at > datetime.now(timezone.utc)
        ).first()

        return record
    
class UserRepository:
    # =================
    # ===== GET =======
    # =================
    def get_by_email(self, email: str, db: Session):
        return db.query(User).filter(User.email == email).first()

    def get_by_id(self, db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()
    
    # lấy toàn bộ thông tin người dùng dựa vào id
    def get_info_user_repo(self, db: Session, user_id: int):
        stmt = select(User).where(User.id == user_id)

        user = db.execute(stmt).scalar_one_or_none()
        if not user:
            return None
        
        return {
            "email": user.email,
            "fullname": user.fullname,
            "address": user.address,
            "phone": user.phone,
            "birth date": user.birth_date,
            "gender": user.gender,
            "activity level": user.activity_level,
            "target goal": user.target_goal 
        }
    
    # chỉ lấy email của người dùng hiện tại
    def get_email_repo(self, db: Session, user_id: int):
        stmt = select(User).where(User.id == user_id)

        user = db.execute(stmt).scalar_one_or_none()
        if not user:
            return None
        
        return {
            "email": user.email
        }
    
    # chỉ lấy địa chỉ của người dùng hiện tại
    def get_address_repo(self, db: Session, user_id: int):
        stmt = select(User).where(User.id == user_id)

        user = db.execute(stmt).scalar_one_or_none()
        if not user:
            return None
        
        return {
            "address": user.address
        }
    
    # chỉ lấy số điện thoại của người dùng hiện tại
    def get_phone_repo(self, db: Session, user_id: int):
        stmt = select(User).where(User.id == user_id)

        user = db.execute(stmt).scalar_one_or_none()
        if not user:
            return None
        
        return {
            "phone": user.phone
        }
    
    # chỉ lấy ngày tháng năm sinh của người dùng hiện tại
    def get_birth_date_repo(self, db: Session, user_id: int):
        stmt = select(User).where(User.id == user_id)

        user = db.execute(stmt).scalar_one_or_none()
        if not user:
            return None
        
        return {
            "birth_date": user.birth_date
        }

    def get_fullname_repo(self, db: Session, user_id):
        stmt = select(User).where(User.id == user_id)

        user = db.execute(stmt).scalar_one_or_none()
        if not user:
            return None
        
        return {
            "fullname": user.fullname
        }

    # ========================
    # ======= UPDATE =========
    # ========================
    # ====== 1. update address =====
    def update_address_repo(self, db, user_id, new_address: str):
        user = db.get(User, user_id)
        if not user:
            return None

        user.address = new_address
        return user

    def update_user(self, db: Session, user: User, data: dict) -> User:
        for field, value in data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    def update_password(self, db: Session, user: User, new_password: str):
        user.password = new_password
        db.commit()
    
    def update_avatar(self, db, user_id: int, avatar_url: str):
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return None

        user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)

        return user

    # cập nhật ngày tháng năm sinh
    def update_birth_date_repo(self, db, user_id, new_birth_date):
        user = db.get(User, user_id)
        if not user:
            return None
        
        birth_date = datetime.strptime(
            new_birth_date,
            "%Y-%m-%d"
        ).date()

        user.birth_date = birth_date

        return user
