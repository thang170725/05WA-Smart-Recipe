#
# ====== nơi import thư viện =======
# 
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import date

from backend.modules.meals.schemas import (
    InputPostMenuSchema, 
    InputRemoveMealSchema,
    InputInsertFoodFromLibrary,
    OutputGetListFoodLibraryByCategoryNameSchema
)
from backend.modules.user.models import User
from backend.modules.account.dependencies import get_current_user
from backend.config.database import get_db
from backend.modules.meals import services

#
#
#
router = APIRouter(prefix="/user", tags=["Meals"])

# ===== POST ======
# lưu 1 món mới được thêm vào khi user chọn chế độ nhập tay
@router.post("/insert-new-meal")
async def post_meals(
    payload: InputPostMenuSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await services.save_new_meal_hand_service(db, current_user.id, payload)

# ==== REMOVE =====
@router.post("/remove-meal")
async def remove_meal(
    payload: InputRemoveMealSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await services.remove_meal_service(db, current_user.id, payload)

# ================================
# ============= GET ==============
# ================================
# hiển thị thực đơn 1 ngày của user bằng plan_date và meal_type
@router.get('/get-food-by-plan_date-and-meal_type')
async def get_food(
    plan_date: date,
    meal_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    data = await services.get_food_by_plan_date_and_meal_type_service(db, current_user.id, plan_date, meal_type)

    return data

# lấy tổng lượng calo tuần của user bằng week_start
@router.get("/get-total-calories-week")
async def get_total_calories_week(
    week_start: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await services.get_total_calories_week_service(db, current_user.id, week_start)

# ==============================================
# ========== API RELATED TO LIBRARY ============
# ==============================================

# ================================
# ============= GET ==============
# ================================
# hiển thị danh sách món ăn trong thư viện
@router.get('/get-list-food-library-by-category-name', response_model=list[OutputGetListFoodLibraryByCategoryNameSchema])
async def get_list_food_library_by_category_name(
    category_name: str,
    db: AsyncSession = Depends(get_db)
):
    return await services.get_list_food_library_by_category_name_service(db, category_name)

# lấy nguyên liệu trong một món ăn
@router.get('/get-ingredients-by-id')
async def get_ingredients_by_id(
    food_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await services.get_ingredients_json_by_id_service(db, food_id)

# lấy hướng dẫn trong một món ăn
@router.get('/get-instructions-by-id')
async def get_instructions_by_id(
    food_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await services.get_instructions_json_by_id_service(db, food_id)

@router.get("/get-id-and-name-food-library")
async def get_id_and_name_food_library(
    db: AsyncSession = Depends(get_db)
):
    return await services.get_id_and_name_from_food_library_table_service(db)

# ===================================
# ====== INSERT =====================
# ===================================
# chèn 1 món từ thư viện vào menu
@router.post('/insert-food-from-library')
async def insert_food_from_library(
    payload: InputInsertFoodFromLibrary,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await services.insert_food_from_library_service(db, current_user.id, payload)