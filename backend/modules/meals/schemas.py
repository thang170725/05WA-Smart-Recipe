from pydantic import BaseModel
from datetime import date, datetime
from typing import Literal, Optional, List, Dict, Any

# IO schemas
# Model cho từng ngày ----
class DayMenuSchema(BaseModel):
    breakfast: List[str]
    lunch: List[str]
    dinner: List[str]
    plan_date: str | None = None


# ===== USER ENTER MEAL AS HAND ===== 
class InputPostMenuSchema(BaseModel):
    food_id: int
    new_meal: str
    meal_type: str
    plan_date: date
    week_start: date
    quantity_value: float
    quantity_unit: str

class InputMealPlan(BaseModel):
    name: str
    plan_date: date
    day_of_week: int
    week_start: date
    meal_type: str

class Meals(BaseModel):
    plan_date: date
    day_of_week: int              # 2 = Mon, ..., 8 = Sun
    meal_type: Literal["breakfast", "lunch", "dinner"]
    name: str
    image_url: Optional[str]
    calories: Optional[int]

class MealsToDay(BaseModel):
    plan_date: date

class MealsToWeekStart(BaseModel):
    week_start: date

class Components(BaseModel):
    protein: int
    fiber: int
    fat: int
    carb: int
    other: int

class MealAnalysis(BaseModel):
    calories: int
    components: Components
    comment: dict
    summarize: str

# Hiển thị danh sách món ăn trong thư viện
class IngredientsJsonSchema(BaseModel):
    name: Optional[str] | None = None 
    mass: Optional[int] | None = None 
    unit: Optional[str] | None = None 
class InstructionsJsonSchema(BaseModel):
    step: Optional[int] | None = None 
    text: Optional[str] | None = None
class OutputGetListFoodLibraryByCategoryNameSchema(BaseModel):
    food_id: int
    food_name: Optional[str] | None = None 
    image_url: Optional[str] | None = None 
    calories: Optional[int] | None = None 
    description: Optional[str] | None = None 
    cooking_time: Optional[int] | None = None 
    difficulty: Optional[str] | None = None 
    category_name: Optional[str] | None = None 
    category_type: Optional[str] | None = None  

# ===== REMOVE MEAL =====
class InputRemoveMealSchema(BaseModel):
    id: int
# =======================
# ===== INSERT  =========
# =======================
# =====================================================================
# === chức năng thêm món ăn từ thư viện vào kếhoạch của user ========
# =====================================================================
class InputInsertFoodFromLibrary(BaseModel):
    food_id: int
    meal_type: str
    plan_date: date
    week_start: date
    quantity: float
    unit: str