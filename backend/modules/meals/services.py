from datetime import date, timedelta, datetime
from backend.modules.meals.reponsitories import MealRepository
from backend.modules.meals.schemas import (
    InputPostMenuSchema, InputRemoveMealSchema, InputInsertFoodFromLibrary
)
from sqlalchemy.orm import Session

class MealService:
    def __init__(self):
        DAY_MAP = {
            2: "Mon",
            3: "Tue",
            4: "Wed",
            5: "Thu",
            6: "Fri",
            7: "Sat",
            8: "Sun",
        }

        MEAL_TYPES = ["breakfast", "lunch", "dinner"]
        self.meal_repo = MealRepository()
    # =================
    # ===== GET =======
    # =================
    def _get_week_start(self, date_str: str) -> str:
        """
        date_str: '2026-02-04'
        return: '2026-02-02' (Monday)
        """
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        monday = date - timedelta(days=date.weekday())
        return monday.strftime("%Y-%m-%d")

    # lấy thực đơn món ăn trong 1 ngày bằng plan_date và mean_type
    def get_food_by_plan_date_and_meal_type_service(self, db: Session, user_id: int, plan_date, meal_type):
        rows = self.meal_repo.get_food_by_plan_date_and_meal_type_repo(db, user_id, plan_date, meal_type) 
        
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

            item["calories_per_100"] = max(food_cal, user_meal_cal)
            
            result.append(item)
            
        return result
    
    def create_meal_plan_items(
        self, 
        db: Session,
        user_id: int,
        name: str,
        plan_date,
        day_of_week: int,
        week_start,
        meal_type: str):          
            return self.meal_repo.create_meal_plan_with_item(
                db,
                user_id,
                name,
                plan_date,
                day_of_week,
                week_start,
                meal_type
            )
    
    # lấy danh sách món ăn trong thư viện bởi category_name
    def get_list_food_library_by_category_name_service(self, db: Session, category_name: str):
        return self.meal_repo.get_list_food_library_by_category_name_repo(db, category_name)
    
    # lấy nguyên liệu của 1 món ăn bằng id
    def get_ingredients_json_by_id_service(self, db: Session, food_id: int):
        return self.meal_repo.get_ingredients_json_by_id_repo(db, food_id)

    # lấy hướng dẫn của 1 món ăn bằng id
    def get_instructions_json_by_id_service(self, db: Session, food_id: int):
        return self.meal_repo.get_instructions_json_by_id_repo(db, food_id)

    # === lấy tổng lượng calo tuần của user bằng week_start ===
    def get_total_calories_week_service(self, db, user_id, week_start):
        return self.meal_repo.get_total_week_calories_repo(db, user_id, week_start)
    
    # lấy id và tên của món tất cả món ăn trong thư viện
    def get_id_and_name_from_food_library_table_service(self, db):
        try:
            rows = self.meal_repo.get_id_and_name_from_food_library_table_repo(db)
            
            return rows
        except Exception as e:
            print("lỗi lấy id và name trong food_library: ", e)
            raise

    # ===== POST =====
    # lưu 1 món mới
    def save_new_meal_hand_service(self, db: Session, user_id, payload: InputPostMenuSchema):
        try:
            self.meal_repo.save_menu_meal_hand_repo(db, user_id, payload)

            db.commit()

            return {"message": "Saved successfully"}
        except Exception as e:
            print("ERROR repo:", e)
            raise
        
    # ====== REMOVE ======
    # xóa 1 món
    def remove_meal_service(self, db: Session, user_id, payload: InputRemoveMealSchema):
        try:
            self.meal_repo.remove_meal_repo(db, payload)

            db.commit()
        except Exception as e:
            print("LỖI XÓA MÓN: ", e)
            raise

    # ====================
    # ====== INSERT ======
    # ====================
    # chèn 1 món từ thư viện vào kế hoạch của user
    def insert_food_from_library_service(self, db: Session, user_id, payload: InputInsertFoodFromLibrary):
        try:
            self.meal_repo.insert_food_from_library_repo(db, user_id, payload)

            db.commit()
        except Exception as e:
            print("LỖI CHÈN MÓN ĂN TỪ THƯ VIỆN VÀO MENU:", e)
            raise