#
# ====== nơi import thư viện =======
#
from sqlalchemy.ext.asyncio import AsyncSession
from backend.modules.user.models import User, OTP
from backend.modules.health.models import HealthMetric
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from backend.modules.user.schemas import InputUpdateProfileSchema

# ============================
# ===== GET REPOSITORY =======
# ============================
async def get_by_email(email: str, db: AsyncSession):
    user = await db.execute(
        select(User).where(User.email == email)
    )

    return user.scalar_one_or_none()

# lấy toàn bộ thông tin người dùng dựa vào id
async def get_info_user_repo(db: AsyncSession, user_id: int):
    stmt = (
        select(User, HealthMetric.height, HealthMetric.weight)
        .join(HealthMetric, HealthMetric.user_id == User.id)
        .where(User.id == user_id, HealthMetric.user_id == user_id)
        .order_by(HealthMetric.recorded_at.desc())
    )

    result = await db.execute(stmt)
    result = result.first()
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
        "weight": weight,
        "password": ""
    }

async def get_by_id(db: AsyncSession, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

async def update_user_repository(
    db: AsyncSession, 
    user_id: int, 
    payload: InputUpdateProfileSchema
):
    user = await db.excute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
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

async def get_user_by_email_repo(db: AsyncSession, email: str):
    user = await db.execute(
        select(User).where(
            User.email==email
        )
    )
    user = user.scalar_one_or_none()
    
    return user
    
# chỉ lấy email của người dùng hiện tại
async def get_email_repo(db: AsyncSession, user_id: int):
    user = await db.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        return None
        
    return {
        "email": user.email
    }
    
# chỉ lấy địa chỉ của người dùng hiện tại
async def get_address_repo(db: AsyncSession, user_id: int):
    user = await db.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        return None
        
    return {
        "address": user.address
    }
    
# chỉ lấy số điện thoại của người dùng hiện tại
async def get_phone_repo(db: AsyncSession, user_id: int):
    user = await db.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        return None
    
    return {
        "phone": user.phone
    }

# chỉ lấy ngày tháng năm sinh của người dùng hiện tại
async def get_birth_date_repo(db: AsyncSession, user_id: int):
    user = await db.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        return None
    
    return {
        "birth_date": user.birth_date
    }

async def get_fullname_repo(db: AsyncSession, user_id):
    user = await db.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        return None
    
    return {
        "fullname": user.fullname
    }

# ===================================
# ======= UPDATE REPOSITORY =========
# ===================================
# ====== 1. update address =====
async def update_address_repo(db, user_id, new_address: str):

    user = await db.get(User, user_id)

    if not user:

        return None

    user.address = new_address

    return user


async def update_password(self, db: AsyncSession, user: User, new_password: str):

    user.password = new_password

    await db.commit()


async def update_avatar(self, db, user_id: int, avatar_url: str):

    result = await db.execute(
        select(User).where(User.id == user_id)
    )

    user = result.scalar_one_or_none()

    if not user:

        return None

    user.avatar_url = avatar_url

    await db.commit()

    await db.refresh(user)

    return user


# cập nhật ngày tháng năm sinh
async def update_birth_date_repo(self, db, user_id, new_birth_date):

    user = await db.get(User, user_id)

    if not user:

        return None

    birth_date = datetime.strptime(

        new_birth_date,

        "%Y-%m-%d"

    ).date()

    user.birth_date = birth_date

    return user