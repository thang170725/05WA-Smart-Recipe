from backend.modules.meals.models import (
    Meal,
    MealPlan,
    MealPlanItem,
    UserMeal,
)
from backend.modules.user.models import User

from backend.modules.meals.schemas import (
    InputPostMenuSchema,
    InputInsertFoodFromLibrary
)

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

# =======================
# ======= INSERT ========
# =======================

# chèn 1 món từ thư viện vào menu của user
async def insert_food_from_library_repo(
    db: AsyncSession,
    user_id: int,
    payload: InputInsertFoodFromLibrary
):
    # 1. tạo row trong table meal_plans
    result = await db.execute(
        select(MealPlan)
        .where(
            MealPlan.user_id == user_id,
            MealPlan.plan_date == payload.plan_date
        )
    )

    existing_plan = result.scalars().first()

    meal_plan = None

    if existing_plan:
        meal_plan = existing_plan

    else:
        meal_plan = MealPlan(
            user_id=user_id,
            plan_date=payload.plan_date,
            week_start=payload.week_start
        )

        db.add(meal_plan)

        await db.flush()

    # 2. tạo row trong table meals
    result = await db.execute(
        select(Meal)
        .where(
            Meal.user_id == user_id,
            Meal.food_id == payload.food_id,
            Meal.quantity == payload.quantity,
            Meal.unit == payload.unit
        )
    )

    existing_meals = result.scalars().first()

    meal = None

    if existing_meals:
        meal = existing_meals

    else:
        meal = Meal(
            user_id=user_id,
            food_id=payload.food_id,
            quantity=payload.quantity,
            unit=payload.unit
        )

        db.add(meal)

        await db.flush()

    # 3. tạo row trong table meal_plan_items
    meal_plan_item = MealPlanItem(
        meal_plan_id=meal_plan.id,
        meal_id=meal.id,
        meal_type=payload.meal_type
    )

    db.add(meal_plan_item)

    await db.flush()

def update_health_profile(db, user_id, bmi, body_fat, health_note):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise ValueError("User not found")

    user.bmi = bmi
    user.body_fat = body_fat
    user.health_note = health_note

    db.commit()
    return user