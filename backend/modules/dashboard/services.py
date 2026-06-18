from sqlalchemy.orm import Session
from backend.modules.dashboard.repositories import DashboardRepo

class DashboardService:
    def __init__(self):
        self.repo = DashboardRepo()
    
    # ======== GET =========
    # lấy thông tin cơ bản của người dùng
    def get_user_infor_service(self, db: Session, user_id):
        return self.repo.get_user_infor_repo(db, user_id)
    
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