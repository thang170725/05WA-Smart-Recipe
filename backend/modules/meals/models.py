from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    UniqueConstraint,
    Index,
    Text,
    JSON,
    Float
)
from sqlalchemy.sql import func
from backend.core.database import Base

class FoodLibrary(Base):
    __tablename__ = "food_library"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    image_url = Column(String(255), nullable=True)
    calories_per_100 = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    description = Column(Text, nullable=True)
    ingredients_json = Column(JSON, nullable=True)
    instructions_json = Column(JSON, nullable=True)
    cooking_time = Column(Integer, nullable=True)
    difficulty = Column(Enum('easy', 'medium', 'hard', name="difficulty_role"), nullable=True)

class FoodLibraryCategory(Base):
    __tablename__ = "food_library_category"

    food_id = Column(
        Integer,
        ForeignKey("food_library.id", ondelete="CASCADE"),
        primary_key=True
    )
    category_id = Column(
        Integer, 
        ForeignKey("category.id", ondelete="CASCADE"),
        primary_key=True)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)
    type = Column(Enum('food', "drink", 'forum', "exercise", name="type_role"))
    slug = Column(String(120), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_date = Column(Date, nullable=False)
    week_start = Column(Date, nullable=False)      # Monday of the week
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "plan_date", name="uniq_user_plan_date"),
        Index("idx_user_week", "user_id", "week_start"),
    )

class MealPlanItem(Base):
    __tablename__ = "meal_plan_items"

    id = Column(Integer, primary_key=True)
    meal_plan_id = Column(
        Integer,
        ForeignKey("meal_plans.id", ondelete="CASCADE"),
        nullable=False
    )
    meal_id = Column(
        Integer,
        ForeignKey("meals.id", ondelete="CASCADE"),
        nullable=False
    )
    meal_type = Column(
        Enum(
            "breakfast",
            "lunch",
            "dinner",
            "snack",
            name="meal_type"
        ),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("meal_plan_id", "meal_id", "meal_type", name="uniq_plan_meal_type"),
        Index("idx_meal_plan_id", "meal_plan_id"),
        Index("idx_plan_type", "meal_plan_id", "meal_type")
    )

class UserMeal(Base):
    __tablename__ = "user_meals"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    calories_per_100 = Column(Float, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="unique_user_meal"),
        Index("idx_user", "user_id"),
    )

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_id = Column(Integer, ForeignKey("food_library.id"), nullable=True)
    user_meal_id = Column(Integer, ForeignKey("user_meals.id"), nullable=True)
    
    quantity = Column(Float, nullable=True)
    unit = Column(String(10), nullable=True)
    created_at = Column(DateTime, server_default=func.now())