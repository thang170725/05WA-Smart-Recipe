#
# ===== nơi import thư viện ======
# 
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists
from backend.modules.user import models 

from backend.modules.user.models import User, OTP
from backend.modules.meals.models import HealthMetric
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from backend.modules.user.schemas import InputUpdateProfileSchema

#
#
#
async def register_repository(data: dict) -> User:
    new_user = User(**data)
    
    return new_user

# lấy email từ db
async def get_by_email_repository(db: AsyncSession, email) -> User | None:
    user = await db.execute(
        select(User).where(User.email == email)
    )

    return user.scalar_one_or_none()

async def check_email_repository(db: AsyncSession, email:str):
    result = await db.execute(
        select(
            exists().where(models.User.email == email)
        )
    )

    return result.scalar()

async def get_by_google_id(db: AsyncSession, google_id: str) -> User | None:
    user = await db.execute(
        select(User).where(User.google_id == google_id)
    )
    return user.scalar_one_or_none()
    
async def verify_otp_repo(db: AsyncSession, email:str, otp: str):
    record = await db.execute(OTP).where(
        OTP.email == email,
        OTP.otp == otp,
        OTP.is_used == False,
        OTP.expires_at > datetime.now(timezone.utc)
    )
    record = record.first()

    return record

# ===============================
# ===== INSERT / POST / WRITE =======
# ===============================
async def insert_otp_repo(db: AsyncSession, email, generate_otp):
    otp = OTP(
        email=email,
        otp=generate_otp,
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).replace(tzinfo=None),
        is_used=False
    )
    await db.add(otp)
    await db.flush()
    return otp

    