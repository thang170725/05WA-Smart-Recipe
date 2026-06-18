from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    TIMESTAMP,
    text,
    Text,
    Float,
    JSON
)
from sqlalchemy.orm import relationship

from backend.core.database import Base


# =============================
# WorkoutProgram
# =============================
class WorkoutProgram(Base):
    __tablename__ = "workout_programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True
    )
    duration_days = Column(Integer, default=30)
    level = Column(
        Enum("beginner", "intermediate", "advanced", name="program_level"),
        nullable=True
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    slug = Column(String(50), unique=True, index=True)

    # =========================
    # Relationships
    # =========================
    category = relationship("Category", backref="workout_programs")
    active_users = relationship(
        "UserActiveProgram",
        back_populates="program",
        cascade="all, delete"
    )


# =============================
# UserActiveProgram
# =============================
class UserActiveProgram(Base):
    __tablename__ = "user_active_programs"

    __table_args__ = (
        UniqueConstraint("user_id", "status", name="uniq_user_status"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    program_id = Column(
        Integer,
        ForeignKey("workout_programs.id", ondelete="CASCADE"),
        nullable=False
    )

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    status = Column(
        Enum("active", "completed", "cancelled", name="program_status"),
        default="active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # =========================
    # Relationships
    # =========================
    user = relationship("User", backref="active_programs")
    program = relationship(
        "WorkoutProgram",
        back_populates="active_users"
    )

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True)

    name = Column(String(100), nullable=False)
    description = Column(Text)

    muscle_group = Column(String(50))

    calories_per_minute = Column(Float)

    difficulty = Column(
        Enum('easy', 'medium', 'hard', name='exercise_difficulty_enum'),
        nullable=False
    )

    image_url = Column(String(255))
    video_url = Column(String(255))

    category_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="CASCADE"),
        index=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    workout_items = relationship("WorkoutPlanItem", back_populates="exercise")
    items = relationship("WorkoutPlanItem", back_populates="exercise")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    __table_args__ = (
        UniqueConstraint("user_id", "plan_date", name="unique_user_plan"),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    plan_date = Column(Date, nullable=False)

    note = Column(String(255))

    status = Column(
        Enum('pending', 'completed', name='workout_status_enum'),
        nullable=False,
        server_default="pending"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
    week_start = Column(
        Date,
        nullable=False
    )

    items = relationship("WorkoutPlanItem", back_populates="workout_plan")

class WorkoutPlanItem(Base):
    __tablename__ = "workout_plan_items"

    id = Column(Integer, primary_key=True)

    workout_plan_id = Column(
        Integer,
        ForeignKey("workout_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    exercise_id = Column(
        Integer,
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    sets = Column(Integer, nullable=True, server_default="3")
    reps = Column(Integer, nullable=True, server_default="12")
    duration_minutes = Column(Integer)
    order_index = Column(Integer)

    workout_plan = relationship("WorkoutPlan", back_populates="items")
    exercise = relationship("Exercise", back_populates="workout_items")

class WorkoutProgramDayItem(Base):
    __tablename__ = "workout_program_day_items"

    id = Column(Integer, primary_key=True, nullable=False)
    program_day_id = Column(
        Integer,
        ForeignKey("workout_program_days.id", ondelete="CASCADE"),
        nullable=False
    )
    exercise_id = Column(
        Integer,
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False
    )
    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    order_index = Column(Integer, nullable=True)

class WorkoutProgramDay(Base):
    __tablename__ = "workout_program_days"

    id = Column(Integer, primary_key=True, nullable=False)
    program_id = Column(
        Integer,
        ForeignKey("workout_programs.id", ondelete="CASCADE"),
        nullable=False
    )
    day_number = Column(Integer, nullable=False)
    title = Column(String(100), nullable=True)
    description = Column(JSON, nullable=True)