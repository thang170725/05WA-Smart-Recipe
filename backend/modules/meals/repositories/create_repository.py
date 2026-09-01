from backend.modules.meals.models import (
    Meal,
    MealPlan,
    MealPlanItem
)

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select


# ======================
# ======== GET =========
# ======================

# lấy thực đơn 1 ngày của user bằng plan date và meal_type
async def create_meal_plan_with_item(
    db: AsyncSession,
    user_id: int,
    name: str,
    plan_date,
    day_of_week: int,
    week_start,
    meal_type: str
):
    # 1️⃣ Meal
    result = await db.execute(
        select(Meal)
        .where(
            Meal.name == name
        )
    )

    meal = result.scalars().first()

    if not meal:
        meal = Meal(
            name=name
        )

        db.add(meal)

        await db.flush()  # lấy meal.id

    # 2️⃣ MealPlan
    result = await db.execute(
        select(MealPlan)
        .where(
            MealPlan.user_id == user_id,
            MealPlan.plan_date == plan_date
        )
    )

    meal_plan = result.scalars().first()

    if not meal_plan:
        meal_plan = MealPlan(
            user_id=user_id,
            plan_date=plan_date,
            day_of_week=day_of_week,
            week_start=week_start,
        )

        db.add(meal_plan)

        await db.flush()  # lấy meal_plan.id

    # 3️⃣ MealPlanItem
    item = MealPlanItem(
        meal_plan_id=meal_plan.id,
        meal_id=meal.id,
        meal_type=meal_type,
    )

    db.add(item)

    await db.commit()

    return item
