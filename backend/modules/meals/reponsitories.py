from backend.modules.meals.models import (
    FoodLibraryCategory, Meal, MealPlanItem, MealPlan, Category, UserMeal, FoodLibrary
)
from sqlalchemy.orm import Session
from backend.modules.meals.queries import get_meals_to_day
from sqlalchemy import (
    text, select, delete,
    func
)
from datetime import timedelta, date
from backend.modules.meals.schemas import InputPostMenuSchema, InputRemoveMealSchema, InputInsertMealFromLibrary

class MealRepository:
    # ======================
    # ======== GET =========
    # ======================
    # lấy thực đơn 1 ngày
    def get_menu_repo(self, db: Session, user_id, plan_date):
        # plan_date: YY-MM-DD
        stmt = (
            select(
                MealPlan.plan_date,
                MealPlan.week_start,

                MealPlanItem.meal_type,
                MealPlanItem.id,
                MealPlanItem.meal_plan_id,
                MealPlanItem.meal_id,

                Meal.quantity,
                Meal.unit,

                UserMeal.name.label("user_meal_name"),
                UserMeal.calories_per_100,

                FoodLibrary.name.label("food_name")
            )
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
                MealPlan.plan_date == plan_date
            )
            .order_by(
                MealPlan.plan_date,
                MealPlanItem.meal_type
            )
        )

        return db.execute(stmt).mappings().all()
    
    def get_meal_to_day(self, db, user_id, plan_date):
        return db.execute(
            text(get_meals_to_day()),
            {
                "user_id": user_id,
                "plan_date": plan_date
            }
        ).mappings().all()

    # lấy danh sách món ăn theo category
    def get_list_food_library_by_category_name_repo(self, db: Session, category_name: str):
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
            .join(FoodLibraryCategory, FoodLibraryCategory.food_id == FoodLibrary.id)
            .join(Category, Category.id == FoodLibraryCategory.category_id)
            .where(Category.name == category_name)
        )

        return db.execute(stmt).mappings().all()

    def get_id_and_name_from_food_library_table_repo(self, db: Session):
        stmt = (
            select(
                FoodLibrary.id,
                FoodLibrary.name
            ).order_by(FoodLibrary.name)
        )

        return db.execute(stmt).mappings().all()
    
    # ==== lấy tổng calo tuần dựa vào week_start='2026-14-02' ===
    def get_total_week_calories_repo(self, 
        db: Session,
        user_id: int,
        week_start: date
    ):
        stmt = (
            select(
                func.coalesce(
                    func.sum(FoodLibrary.calories_per_100 * Meal.quantity * 0.1),
                    0
                ).label("total_calories")
            )
            .join(Meal, Meal.food_id == FoodLibrary.id)
            .where(
                Meal.created_at >= week_start,
                Meal.created_at < week_start + timedelta(days=7),
                Meal.user_id == user_id
            )
        )

        return db.execute(stmt).scalar()

    def create_meal_plan_with_item(
        self,
        db: Session,
        user_id: int,
        name: str,
        plan_date,
        day_of_week: int,
        week_start,
        meal_type: str
    ):
        try:
            # 1️⃣ Meal
            meal = db.query(Meal).filter(Meal.name == name).first()
            if not meal:
                meal = Meal(name=name)
                db.add(meal)
                db.flush()  # lấy meal.id

            # 2️⃣ MealPlan
            meal_plan = (
                db.query(MealPlan)
                .filter(
                    MealPlan.user_id == user_id,
                    MealPlan.plan_date == plan_date
                )
                .first()
            )

            if not meal_plan:
                meal_plan = MealPlan(
                    user_id=user_id,
                    plan_date=plan_date,
                    day_of_week=day_of_week,
                    week_start=week_start,
                )

            db.add(meal_plan)
            db.flush()  # lấy meal_plan.id

            # 3️⃣ MealPlanItem
            item = MealPlanItem(
                meal_plan_id=meal_plan.id,
                meal_id=meal.id,
                meal_type=meal_type,
            )
            db.add(item)

            db.commit()
            return item
        except Exception:
            db.rollback()
            raise
    
    # ===== DELETE =====
    # xóa thực đơn tuần bằng user_id và ngày đầu tuần
    def delete_meal_week_repo(self, db: Session, user_id, week_start):
        meals = db.query(MealPlan).filter(
            MealPlan.user_id == user_id,
            MealPlan.week_start == week_start
        ).all()

        for meal in meals:
            db.delete(meal)

        db.commit()

    # ====== POST ========
    # ghi vào bảng user_meals
    # lưu một món khi nhập tay
    def save_menu_meal_hand_repo(self, db: Session, user_id: int, payload: InputPostMenuSchema):
        # 1. Ghi vào bảng meal_plans
        existing_plan = db.query(MealPlan).filter_by(
            user_id=user_id,
            plan_date=payload.plan_date
        ).first()
        if existing_plan:
            meal_plan = existing_plan
        else:
            meal_plan = MealPlan(
                user_id=user_id,
                plan_date=payload.plan_date,
                week_start=payload.week_start
            )
            db.add(meal_plan)
            db.flush()

        # 2. ghi vào bảng user_meals (nếu món chưa có trong library)
        user_meal = None
        if payload.food_id == -1:
            user_meal = db.query(UserMeal).filter(
                UserMeal.user_id == user_id, 
                UserMeal.name == payload.new_meal
            ).first()
        if payload.food_id == -1 and not user_meal:
            user_meal = UserMeal(
                user_id=user_id, 
                name=payload.new_meal,
            )
            db.add(user_meal)
            db.flush()  # lấy 
            
            meal = Meal(
                user_id=user_id,
                user_meal_id=user_meal.id,
                quantity=payload.quantity_value,
                unit=payload.quantity_unit
            )
            db.add(meal)
            db.flush() 

        # 3. ghi và bảng meals
        if payload.food_id != -1:
            meal = Meal(
                user_id=user_id,
                food_id=payload.food_id,
                quantity=payload.quantity_value,
                unit=payload.quantity_unit
            )
            db.add(meal)
            db.flush()
        
        # 4. ghi vào bảng meal_plan_items
        meal_plan_item = MealPlanItem(
            meal_plan_id=meal_plan.id,
            meal_id=meal.id,
            meal_type=payload.meal_type
        )
        db.add(meal_plan_item)
        db.flush()

    # ======= INSERT =====
    # chèn 1 món từ thư viện vào menu
    def insert_meal_from_library_repo(self, db: Session, user_id, payload: InputInsertMealFromLibrary):
        # 1. tạo row trong table meal_plans
        existing_plan = db.query(MealPlan).filter_by(
            user_id=user_id,
            plan_date=payload.plan_date
        ).first()

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
            db.flush()
        
        # 2. tạo row trong table meal_plan_items
        meal_plan_item = MealPlanItem(
            meal_plan_id=meal_plan.id,
            meal_id=payload.meal_id,
            meal_type=payload.meal_type
        )
        db.add(meal_plan_item)
        db.flush()

    # ======= REMOVE =======
    # xóa 1 món
    def remove_meal_repo(self, db: Session, payload: InputRemoveMealSchema):
        meal_plan_item = db.get(MealPlanItem, payload.id)

        db.delete(meal_plan_item)    