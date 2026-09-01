from backend.modules.meals.models import (
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


# ======= REMOVE =======

# xóa 1 món
async def remove_meal_repo(
    db: AsyncSession,
    payload: InputRemoveMealSchema
):
    meal_plan_item = await db.get(
        MealPlanItem,
        payload.id
    )

    await db.delete(
        meal_plan_item
    )
