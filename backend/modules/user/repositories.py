from sqlalchemy.orm import Session
from backend.modules.user.models import User, OTP
from backend.modules.health.models import HealthMetric
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from backend.modules.user.schemas import InputUpdateProfileSchema

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
    
    def verify_otp_repo(self, db: Session, email:str, otp: str):
        record = db.query(OTP).filter(
            OTP.email == email,
            OTP.otp == otp,
            OTP.is_used == False,
            OTP.expires_at > datetime.now(timezone.utc)
        ).first()

        return record
    
    # ===============================
    # ===== INSERT / POST / WRITE =======
    # ===============================
    def insert_otp_repo(self, db: Session, email, generate_otp):
        otp = OTP(
            email=email,
            otp=generate_otp,
            expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).replace(tzinfo=None),
            is_used=False
        )
        db.add(otp)
        db.flush()

        return otp

    
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
        stmt = (
            select(User, HealthMetric.height, HealthMetric.weight)
            .join(HealthMetric, HealthMetric.user_id == User.id)
            .where(User.id == user_id, HealthMetric.user_id == user_id)
            .order_by(HealthMetric.recorded_at.desc())
        )

        result = db.execute(stmt).one_or_none()
        if not result:
            return None
        user, height, weight = result
        
        return {
            "id": user.id,
            "role": user.role,
            "email": user.email,
            "created_at": user.created_at,
            "avatar_url": user.avatar_url,
            "fullname": user.fullname,
            "address": user.address,
            "phone": user.phone,
            "birth_date": user.birth_date,
            "gender": user.gender,
            "activity_level": user.activity_level,
            "target_goal": user.target_goal,
            "height": height,
            "weight": weight
        }
    
    def get_user_by_email_repo(self, db: Session, email: str):
        stmt = select(User).where(
            User.email==email
        )

        user = db.execute(stmt).scalar_one_or_none()
        return user
    
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

    def update_user_repo(self, 
        db: Session, 
        user_id: int, 
        payload: InputUpdateProfileSchema
    ):
        stmt = select(User).where(User.id == user_id)
        user = db.excute(stmt).scalar_one_or_none()
        if user is None:
            raise ValueError("user not found")

        user.fullname = payload.fullname
        user.address = payload.address
        user.phone = payload.phone
        user.birth_date = payload.birth_date
        user.gender = payload.gender
        user.activity_level = payload.activity_level
        user.target_goal = payload.target_goal
        user.avatar_url = payload.avatar_url

        health_metric = HealthMetric(
            user_id=user_id,
            height=payload.height,
            weight=payload.weight
        )

        return user, health_metric

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
