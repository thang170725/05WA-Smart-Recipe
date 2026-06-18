from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, Date, DateTime, Boolean
from backend.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(50), nullable=False)
    password = Column(String(500), nullable=True)

    role = Column(
        Enum('user', 'admin', name='user_role'),
        nullable=False,
        default="user"
    )
    fullname = Column(String(50), nullable=True)
    address = Column(String(100), nullable=True)
    
    birth_date = Column(Date, nullable=True)
    phone = Column(String(15), nullable=True)
    google_id = Column(String, nullable=True, unique=True)
    created_at = Column(TIMESTAMP)
    gender = Column(
        Enum('male', 'female', 'other', name='gender_role'),
        nullable=True,
        default="male"
    )
    activity_level = Column(
        Enum('sedentary', 'light', "moderate", "active", "very_active", name='activity_level_role'),
        nullable=True,
        default="moderate"
    )
    target_goal = Column(
        Enum('lose_weight', 'gain_muscle', 'maintenance', name='target_goal_role'),
        nullable=True,
    )
    avatar_url = Column(String(255), nullable=True)

# bảng otp
class OTP(Base):
    __tablename__ = "otp"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), index=True)
    otp = Column((String(20)))
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)