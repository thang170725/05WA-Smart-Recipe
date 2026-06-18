from sqlalchemy.orm import Session
from sqlalchemy import func, select
from backend.modules.user.models import User
from backend.modules.health.models import HealthMetric, HealthHistory
from backend.modules.meals.models import MealPlan, MealPlanItem, Meal
from backend.modules.workout.models import WorkoutPlan, WorkoutPlanItem, Exercise
from backend.modules.platform.models import Platform, Comment

class DashboardRepo:
    def get_user_infor_repo(self, db: Session, user_id: int):
        stmt = (
            select(
                User.fullname,
                User.birth_date,
                User.gender,
                User.activity_level,
                User.target_goal,

                HealthMetric.height,
                HealthMetric.weight,
                HealthMetric.bmi,
                HealthMetric.bmr,
                HealthMetric.tdee,
                HealthMetric.health_status
            )
            .join(HealthMetric, HealthMetric.user_id == User.id)
            .where(User.id == user_id)
        )
        return db.execute(stmt).mappings().first()

    # PROFILE + HEALTH
    def get_health_history_repo(self, db: Session, user_id: int):
        stmt = (
            select(
                HealthHistory.month,
                HealthHistory.bmi_avarage
            )
            .where(HealthHistory.user_id == user_id)
        )

        return db.execute(stmt).mappings().all()

    def get_latest_health(self, db: Session, user_id: int):
        return (
            db.query(HealthMetric)
            .filter(HealthMetric.user_id == user_id)
            .order_by(HealthMetric.recorded_at.desc())
            .first()
        )



    # =============================
    # STATS
    # =============================
    def count_meal_plans(self, db: Session, user_id: int):
        return db.query(func.count(MealPlan.id)) \
            .filter(MealPlan.user_id == user_id).scalar()

    def count_completed_workouts(self, db: Session, user_id: int):
        return db.query(func.count(WorkoutPlan.id)) \
            .filter(
                WorkoutPlan.user_id == user_id,
                WorkoutPlan.status == "completed"
            ).scalar()

    def count_posts(self, db: Session, user_id: int):
        return db.query(func.count(Platform.id)) \
            .filter(Platform.user_id == user_id).scalar()

    def count_comments(self, db: Session, user_id: int):
        return db.query(func.count(Comment.id)) \
            .filter(Comment.user_id == user_id).scalar()

    # =============================
    # BMI TREND
    # =============================
    def get_bmi_trend(self, db: Session, user_id: int):
        return (
            db.query(
                func.date_format(HealthMetric.recorded_at, "%Y-%m").label("month"),
                HealthMetric.bmi
            )
            .filter(HealthMetric.user_id == user_id)
            .order_by(HealthMetric.recorded_at.asc())
            .all()
        )

    # =============================
    # WORKOUT WEEKLY
    # =============================
    def get_workout_weekly(self, db: Session, user_id: int):
        return (
            db.query(
                func.week(WorkoutPlan.plan_date).label("week"),
                func.count(WorkoutPlan.id).label("sessions")
            )
            .filter(
                WorkoutPlan.user_id == user_id,
                WorkoutPlan.status == "completed"
            )
            .group_by(func.week(WorkoutPlan.plan_date))
            .all()
        )

    # =============================
    # MUSCLE DISTRIBUTION
    # =============================
    def get_muscle_distribution(self, db: Session, user_id: int):
        return (
            db.query(
                Exercise.muscle_group,
                func.count(WorkoutPlanItem.id).label("value")
            )
            .join(WorkoutPlanItem.exercise)
            .join(WorkoutPlanItem.workout_plan)
            .filter(WorkoutPlan.user_id == user_id)
            .group_by(Exercise.muscle_group)
            .all()
        )