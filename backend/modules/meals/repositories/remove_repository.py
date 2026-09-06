from backend.modules.meals.models import (
    Meal,
    MealPlan,
    MealPlanItem
)

from backend.modules.meals.schemas import (
    InputRemoveMealSchema
)

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select


# ===== DELETE =====

# xóa thực đơn tuần bằng user_id và ngày đầu tuần
async def delete_meal_week_repo(
    db: AsyncSession,
    user_id,
    week_start
):
    result = await db.execute(
        select(MealPlan)
        .where(
            MealPlan.user_id == user_id,
            MealPlan.week_start == week_start
        )
    )

    meals = result.scalars().all()

    for meal in meals:
        await db.delete(meal)

    await db.commit()

# =================================
# ======= REMOVE REPOSITORY =======
# =================================
# xóa 1 món
async def remove_meal_repository(
    db: AsyncSession,
    user_id: int,
    meal_id: int
):
    meal = await db.execute(
        select(Meal).where(Meal.id==meal_id)
    )
    meal = meal.scalar_one_or_none()

    if meal:
        await db.delete(meal)
    
        return "success"
    else: 
        return None
