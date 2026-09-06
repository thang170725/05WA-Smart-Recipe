#
# ======= nơi để setup logging =====
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from datetime import date, timedelta, datetime

from backend.modules.meals.repositories import (
    create_repository, get_repository, insert_repository, save_repository, remove_repository
)

from backend.modules.meals.schemas import (
    InputPostMenuSchema,
    InputRemoveMealSchema,
    InputInsertFoodFromLibrary
)

from sqlalchemy.ext.asyncio import AsyncSession


# =========================
# ===== GET SERVICE =======
# =========================
# service lấy toàn bộ thư viện món ăn
async def get_foods_library_service(db):
    try:
        foods_lib = await get_repository.get_foods_library_repository(db)

        return foods_lib if foods_lib else None
    except Exception as e:
        logger.error(f"get_foods_library_service: {e}")
        raise

def _get_week_start(date_str: str) -> str:
    try:
        """
        date_str: '2026-02-04'
        return: '2026-02-02' (Monday)
        """

        date = datetime.strptime(date_str, "%Y-%m-%d").date()

        monday = date - timedelta(days=date.weekday())

        return monday.strftime("%Y-%m-%d")

    except Exception as e:
        print("ERROR get_week_start:", e)
        raise


# lấy thực đơn món ăn trong 1 ngày bằng plan_date và mean_type
async def get_food_by_plan_date_and_meal_type_service(
    db: AsyncSession,
    user_id: int,
    plan_date,
    meal_type
):
    try:
        rows = await get_repository.get_food_by_plan_date_and_meal_type_repo(
            db,
            user_id,
            plan_date,
            meal_type
        )

        result = []

        for row in rows:
            base = dict(row)

            food_name = base.pop('food_name')
            user_meal_name = base.pop('user_meal_name')

            item = base.copy()

            # nếu có meal
            if food_name:
                item['name'] = food_name

            # nếu có user_meal
            if user_meal_name:
                item['name'] = user_meal_name

            food_cal = base.get("food_calories_per_100") or 0
            user_meal_cal = base.get("user_meal_calories_per_100") or 0

            item["calories_per_100"] = max(
                food_cal,
                user_meal_cal
            )

            result.append(item)

        return result

    except Exception as e:
        print("ERROR get_food_by_plan_date_and_meal_type_service:", e)
        raise


async def create_meal_plan_items(
    db: AsyncSession,
    user_id: int,
    name: str,
    plan_date,
    day_of_week: int,
    week_start,
    meal_type: str
):
    try:
        return await create_repository.create_meal_plan_with_item(
            db,
            user_id,
            name,
            plan_date,
            day_of_week,
            week_start,
            meal_type
        )

    except Exception as e:
        print("ERROR create_meal_plan_items:", e)
        raise


# lấy danh sách món ăn trong thư viện bởi category_name
async def get_list_food_library_by_category_name_service(db: AsyncSession, category_name: str):
    try:
        rows = await get_repository.get_list_food_library_by_category_name_repo(db, category_name)
        rows = [dict(row) for row in rows]
        for row in rows:
            row['unit_support'] = row['unit_support'].split(',')
        
        return rows
    except Exception as e:
        logger.error("ERROR get_list_food_library_by_category_name_service:", e)
        raise


# lấy nguyên liệu của 1 món ăn bằng id
async def get_ingredients_json_by_id_service(
    db: AsyncSession,
    food_id: int
):
    try:
        return await get_repository.get_ingredients_json_by_id_repo(
            db,
            food_id
        )

    except Exception as e:
        print("ERROR get_ingredients_json_by_id_service:", e)
        raise


# lấy hướng dẫn của 1 món ăn bằng id
async def get_instructions_json_by_id_service(
    db: AsyncSession,
    food_id: int
):
    try:
        return await get_repository.get_instructions_json_by_id_repo(
            db,
            food_id
        )

    except Exception as e:
        print("ERROR get_instructions_json_by_id_service:", e)
        raise


# lấy tổng lượng calo tuần của user bằng week_start
async def get_total_calories_week_service(
    db: AsyncSession,
    user_id,
    week_start
):
    try:
        data = await get_repository.get_total_week_calories_repository(db, user_id, week_start)

        return data

    except Exception as e:
        print("ERROR get_total_calories_week_service:", e)
        raise


# lấy id và tên của món tất cả món ăn trong thư viện
async def get_id_and_name_from_food_library_table_service(
    db: AsyncSession
):
    try:
        rows = await get_repository.get_id_and_name_from_food_library_table_repo(
            db
        )

        return rows

    except Exception as e:
        print("lỗi lấy id và name trong food_library: ", e)
        raise


# ===== POST =====
# lưu 1 món mới
async def save_new_meal_hand_service(
    db: AsyncSession,
    user_id,
    payload: InputPostMenuSchema
):
    try:
        await save_repository.save_menu_meal_hand_repo(
            db,
            user_id,
            payload
        )

        await db.commit()

        return {"message": "Saved successfully"}

    except Exception as e:
        print("ERROR repo:", e)

        await db.rollback()

        raise

# ============================
# ====== REMOVE SERVICE ======
# ============================
# xóa 1 món
async def remove_meal_service(
    db: AsyncSession,
    user_id,
    meal_id
):
    try:
        await remove_repository.remove_meal_repository(db, user_id, meal_id)

        await db.commit()
    except Exception as e:
        print("LỖI XÓA MÓN: ", e)
        await db.rollback()
        raise


# ====================
# ====== INSERT ======
# ====================

# chèn 1 món từ thư viện vào kế hoạch của user
async def insert_food_from_library_service(
    db: AsyncSession,
    user_id,
    payload: InputInsertFoodFromLibrary
):
    try:
        await insert_repository.insert_food_from_library_repo(
            db,
            user_id,
            payload
        )

        await db.commit()

    except Exception as e:
        print(
            "LỖI CHÈN MÓN ĂN TỪ THƯ VIỆN VÀO MENU:",
            e
        )

        await db.rollback()

        raise