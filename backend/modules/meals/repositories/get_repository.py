from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import (
    select,
    text,
    func,
    case
)

from datetime import date

from backend.modules.meals.models import (
    FoodLibrary,
    UserMeal,
    Meal,
    MealPlan,
    MealPlanItem,
    FoodLibraryCategory,
    Category
)

from backend.modules.meals.queries import get_meals_to_day


# plan_date: YY-MM-DD
async def get_food_by_plan_date_and_meal_type_repo(
    db: AsyncSession,
    user_id: int,
    plan_date,
    meal_type: str
):
    stmt = (
        select(
            FoodLibrary.id,
            FoodLibrary.name.label("food_name"),
            FoodLibrary.image_url,
            FoodLibrary.calories_per_100.label("food_calories_per_100"),
            FoodLibrary.description,
            UserMeal.name.label("user_meal_name"),
            UserMeal.calories_per_100.label("user_meal_calories_per_100"),
            Meal.quantity,
            Meal.unit
        )

        .select_from(MealPlan)  # chỉ định bảng gốc

        .join(
            MealPlanItem,
            MealPlan.id == MealPlanItem.meal_plan_id
        )

        .outerjoin(
            Meal,
            MealPlanItem.meal_id == Meal.id
        )

        .outerjoin(
            UserMeal,
            Meal.user_meal_id == UserMeal.id
        )

        .outerjoin(
            FoodLibrary,
            Meal.food_id == FoodLibrary.id
        )

        .where(
            MealPlan.user_id == user_id,
            MealPlan.plan_date == plan_date,
            MealPlanItem.meal_type == meal_type,
        )

        .order_by(
            MealPlan.plan_date,
            MealPlanItem.meal_type
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


async def get_meal_to_day(
    db: AsyncSession,
    user_id,
    plan_date
):
    result = await db.execute(
        text(get_meals_to_day()),
        {
            "user_id": user_id,
            "plan_date": plan_date
        }
    )

    return result.mappings().all()


# lấy danh sách món ăn theo category
async def get_list_food_library_by_category_name_repo(
    db: AsyncSession,
    category_name: str
):
    stmt = (
        select(
            FoodLibrary.id.label("food_id"),
            FoodLibrary.name.label("food_name"),
            FoodLibrary.image_url,
            FoodLibrary.calories_per_100,
            FoodLibrary.description,
            FoodLibrary.cooking_time,
            FoodLibrary.difficulty,
            Category.name.label("category_name"),
            Category.type.label("category_type"),
        )

        .join(
            FoodLibraryCategory,
            FoodLibraryCategory.food_id == FoodLibrary.id
        )

        .join(
            Category,
            Category.id == FoodLibraryCategory.category_id
        )

        .where(
            Category.name == category_name
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


# lấy nguyên liệu của 1 món ăn bằng id
async def get_ingredients_json_by_id_repo(
    db: AsyncSession,
    food_id: int
):
    stmt = select(
        FoodLibrary.ingredients_json
    ).where(
        FoodLibrary.id == food_id
    )

    result = await db.execute(stmt)

    return result.scalars().first()


# lấy hướng dẫn của 1 món ăn bằng id
async def get_instructions_json_by_id_repo(
    db: AsyncSession,
    food_id: int
):
    stmt = select(
        FoodLibrary.instructions_json
    ).where(
        FoodLibrary.id == food_id
    )

    result = await db.execute(stmt)

    return result.scalars().first()


async def get_id_and_name_from_food_library_table_repo(
    db: AsyncSession
):
    stmt = (
        select(
            FoodLibrary.id,
            FoodLibrary.name
        )
        .order_by(
            FoodLibrary.name
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


# lấy tổng lượng calo tuần dựa vào week_start='2026-14-02'
async def get_total_week_calories_repo(
    db: AsyncSession,
    user_id: int,
    week_start: date
):
    stmt = (
        select(
            func.round(
                func.sum(
                    case(
                        (
                            Meal.food_id.isnot(None),
                            FoodLibrary.calories_per_100 * Meal.quantity / 100
                        ),
                        (
                            Meal.user_meal_id.isnot(None),
                            UserMeal.calories_per_100 * Meal.quantity / 100
                        ),
                        else_=0
                    )
                )
            ).label("total_week_calories")
        )

        .select_from(MealPlan)

        .join(
            MealPlanItem,
            MealPlanItem.meal_plan_id == MealPlan.id
        )

        .join(
            Meal,
            Meal.id == MealPlanItem.meal_id
        )

        .outerjoin(
            FoodLibrary,
            FoodLibrary.id == Meal.food_id
        )

        .outerjoin(
            UserMeal,
            UserMeal.id == Meal.user_meal_id
        )

        .group_by(
            MealPlan.week_start
        )

        .where(
            Meal.user_id == user_id,
            MealPlan.week_start == week_start
        )
    )

    result = await db.execute(stmt)

    return float(
        result.scalar() or 0
    )