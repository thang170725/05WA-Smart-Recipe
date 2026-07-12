from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.modules.meals.models import MealPlan, MealPlanItem, UserMeal, Meal
from backend.modules.workout.models import WorkoutPlan, WorkoutPlanItem, Exercise

class AIMLRepo:
    # tính tổng lượng calo nạp vào theo tháng
    def get_total_meal_calories(self, session: Session, user_id: int, month: int):
        return (
            session.query(
                MealPlan.user_id,
                func.extract("year", MealPlan.plan_date).label("year"),
                func.extract("month", MealPlan.plan_date).label("month"),
                func.sum(
                    func.coalesce(Meal.calories, UserMeal.calories)
                ).label("total_calories")
            )
            .join(MealPlanItem, MealPlanItem.meal_plan_id == MealPlan.id)
            .outerjoin(Meal, MealPlanItem.meal_id == Meal.id)
            .outerjoin(UserMeal, MealPlanItem.user_meal_id == UserMeal.id)
            .filter(
                MealPlan.user_id == user_id,
                func.extract("month", MealPlan.plan_date) == month
            )
            .group_by(
                MealPlan.user_id,
                func.extract("year", MealPlan.plan_date),
                func.extract("month", MealPlan.plan_date)
            )
            .all()
        )
