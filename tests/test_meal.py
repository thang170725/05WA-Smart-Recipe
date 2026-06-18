from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db
from backend.modules.meals.services import MealService
from datetime import date

db_gen = get_db()
db = next(db_gen)
user = get_current_user()
service = MealService()
meals = service.get_meals(db, 15, date("2025-02-16"))
print(meals) 