from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date

from backend.modules.meals.schemas import (
    InputPostMenuSchema, 
    InputRemoveMealSchema,
    InputInsertMealFromLibrary,
    OutputGetListFoodLibraryByCategoryNameSchema
)
from backend.modules.user.models import User
from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db
from backend.modules.meals.services import MealService

router = APIRouter(prefix="/user", tags=["Meals"])
service = MealService()

# ===== POST ======
# lưu 1 món mới được thêm vào khi user chọn chế độ nhập tay
@router.post("/insert-new-meal")
def post_meals(
    payload: InputPostMenuSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.save_new_meal_hand_service(db, current_user.id, payload)

# ==== REMOVE =====
@router.post("/remove-meal")
def remove_meal(
    payload: InputRemoveMealSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.remove_meal_service(db, current_user.id, payload)

# ================================
# ============= GET ==============
# ================================
# hiển thị thực đơn 1 ngày
@router.get('/get-meals')
def get_meals(
    plan_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = service.get_meals_service(db, current_user.id, plan_date)

    return data

# ==============================================
# ========== API RELATED TO LIBRARY ============
# ==============================================

# ================================
# ============= GET ==============
# ================================
# hiển thị danh sách món ăn trong thư 
@router.get('/get-list-food-library-by-category-name', response_model=list[OutputGetListFoodLibraryByCategoryNameSchema])
def get_list_food_library_by_category_name(
    category_name: str,
    db: Session = Depends(get_db)
):
    return service.get_list_food_library_by_category_name_service(db, category_name)

@router.get("/get-id-and-name-food-library")
def get_id_and_name_food_library(
    db: Session = Depends(get_db)
):
    return service.get_id_and_name_from_food_library_table_service(db)

@router.get("/get-total-calories-week")
def get_total_calories_week(
    week_start: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_total_calories_week_service(db, current_user.id, week_start)

# ====== INSERT =====
# chèn 1 món từ thư viện vào menu
@router.post('/insert-meal-from-library')
def insert_meal_from_library(
    payload: InputInsertMealFromLibrary,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.insert_meal_from_library_service(db, current_user.id, payload)