from backend.modules.meals.models import (
    Meal,
    MealPlan,
    MealPlanItem,
    UserMeal
)

from backend.modules.meals.schemas import (
    InputPostMenuSchema,
    InputInsertFoodFromLibrary
)

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select


# ====== POST ========
# ghi vào bảng user_meals
# lưu một món khi nhập tay
async def save_menu_meal_hand_repo(
    db: AsyncSession,
    user_id: int,
    payload: InputPostMenuSchema
):
    # 1. Ghi vào bảng meal_plans
    result = await db.execute(
        select(MealPlan)
        .where(
            MealPlan.user_id == user_id,
            MealPlan.plan_date == payload.plan_date
        )
    )

    existing_plan = result.scalars().first()

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

    # 2. ghi vào bảng user_meals (nếu món chưa có trong library)
    user_meal = None

    if payload.food_id == -1:
        result = await db.execute(
            select(UserMeal)
            .where(
                UserMeal.user_id == user_id,
                UserMeal.name == payload.new_meal
            )
        )

        user_meal = result.scalars().first()

    if payload.food_id == -1 and not user_meal:
        user_meal = UserMeal(
            user_id=user_id,
            name=payload.new_meal,
        )

        db.add(user_meal)

        await db.flush()  # lấy

        meal = Meal(
            user_id=user_id,
            user_meal_id=user_meal.id,
            quantity=payload.quantity_value,
            unit=payload.quantity_unit
        )

        db.add(meal)

        await db.flush()

    # 3. ghi và bảng meals
    if payload.food_id != -1:
        meal = Meal(
            user_id=user_id,
            food_id=payload.food_id,
            quantity=payload.quantity_value,
            unit=payload.quantity_unit
        )

        db.add(meal)

        await db.flush()

    # 4. ghi vào bảng meal_plan_items
    meal_plan_item = MealPlanItem(
        meal_plan_id=meal_plan.id,
        meal_id=meal.id,
        meal_type=payload.meal_type
    )

    db.add(meal_plan_item)

    await db.flush()