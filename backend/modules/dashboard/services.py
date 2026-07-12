from sqlalchemy.orm import Session
from backend.modules.dashboard.repositories import DashboardRepo
from backend.modules.user.services import UserService
from backend.modules.health.services import HealthMetricService
from backend.modules.ai_ml.services import AIMLService

from datetime import date

class DashboardService:
    def __init__(self):
        self.repo = DashboardRepo()
        self.user_service = UserService()
        self.health_metric = HealthMetricService()
        self.ai_ml = AIMLService()
    
    # ======================
    # ======== GET =========
    # ======================
    # lấy thông tin cơ bản của người dùng
    def get_user_infor_service(self, db: Session, user_id: int):
        try:
            user = self.user_service.get_profile(db, user_id)
            health_metric = self.health_metric.get_health_metrics_info_service(db, user_id)
            
            bmi, label = self.ai_ml._calc_bmi(health_metric.weight, health_metric.height)
            birth_date = date.fromisoformat(str(user.birth_date))
            today = date.today()
            age = today.year - birth_date.year - (
                (today.month, today.day) < (birth_date.month, birth_date.day)
            )

            bmr = self.ai_ml._calc_bmr(
                health_metric.weight,
                health_metric.height,
                age,
                user.gender
            )

            tdee = self.ai_ml._calc_tdee(bmr, user.activity_level)

            return {
                "fullname": user.fullname,
                "target_goal": user.target_goal,
                "activity_level": user.activity_level,

                "health_status": health_metric.health_status,
                "height": health_metric.height,
                "weight": health_metric.weight,

                "bmi": bmi,
                "bmr": bmr,
                "tdee": tdee
            }
        except Exception as e:
            raise ValueError(e)

    def get_health_history_service(self, db: Session, user_id: int):
        return self.repo.get_health_history_repo(db, user_id)

    def get_program_workout(self, db: Session, user_id: int):

        user = self.repo.get_user(db, user_id)
        health = self.repo.get_latest_health(db, user_id)

        # Stats
        total_meal_plans = self.repo.count_meal_plans(db, user_id)
        completed_workouts = self.repo.count_completed_workouts(db, user_id)
        total_posts = self.repo.count_posts(db, user_id)
        total_comments = self.repo.count_comments(db, user_id)

        bmi_trend = self.repo.get_bmi_trend(db, user_id)
        workout_weekly = self.repo.get_workout_weekly(db, user_id)
        muscle_distribution = self.repo.get_muscle_distribution(db, user_id)

        return {
            "profile": {
                "fullname": user.fullname,
                "gender": user.gender,
                "activity_level": user.activity_level,
                "target_goal": user.target_goal,
                "weight": health.weight if health else None,
                "height": health.height if health else None,
                "bmi": health.bmi if health else None,
                "bmr": health.bmr if health else None,
                "tdee": health.tdee if health else None,
                "health_status": health.health_status if health else None,
                "last_checkup": health.recorded_at if health else None,
            },
            "stats": {
                "total_meal_plans": total_meal_plans,
                "completed_workouts": completed_workouts,
                "total_posts": total_posts,
                "total_comments": total_comments,
            },
            "bmi_trend": [
                {"month": row.month, "bmi": row.bmi}
                for row in bmi_trend
            ],
            "workout_weekly": [
                {"week": f"W{row.week}", "sessions": row.sessions}
                for row in workout_weekly
            ],
            "calories_weekly": [],  # có thể bổ sung sau
            "muscle_distribution": [
                {"name": row.muscle_group, "value": row.value}
                for row in muscle_distribution
            ]
        }