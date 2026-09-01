from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.dashboard import repositories

from backend.modules.user import services as user_services

from backend.modules.health import services as health_services

from backend.modules.ai_ml import services as ai_ml_services

from datetime import date


# ======================
# ======== GET =========
# ======================

# lấy thông tin cơ bản của người dùng
async def get_user_infor_service(
    db: AsyncSession,
    user_id: int
):
    try:
        user = await user_services.get_profile(
            db,
            user_id
        )

        health_metric = await health_services.get_health_metrics_info_service(
            db,
            user_id
        )

        bmi, label = ai_ml_services._calc_bmi(
            health_metric.weight,
            health_metric.height
        )

        birth_date = date.fromisoformat(
            str(user.birth_date)
        )

        today = date.today()

        age = today.year - birth_date.year - (
            (today.month, today.day)
            < (birth_date.month, birth_date.day)
        )

        bmr = ai_ml_services._calc_bmr(
            health_metric.weight,
            health_metric.height,
            age,
            user.gender
        )

        tdee = ai_ml_services._calc_tdee(
            bmr,
            user.activity_level
        )

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


async def get_health_history_service(
    db: AsyncSession,
    user_id: int
):
    try:
        return await repositories.get_health_history_repo(
            db,
            user_id
        )

    except Exception as e:
        raise ValueError(e)


async def get_program_workout(
    db: AsyncSession,
    user_id: int
):
    try:
        user = await repositories.get_user_infor_repo(
            db,
            user_id
        )

        health = await repositories.get_latest_health(
            db,
            user_id
        )

        # Stats
        total_meal_plans = await repositories.count_meal_plans(
            db,
            user_id
        )

        completed_workouts = await repositories.count_completed_workouts(
            db,
            user_id
        )

        total_posts = await repositories.count_posts(
            db,
            user_id
        )

        total_comments = await repositories.count_comments(
            db,
            user_id
        )

        bmi_trend = await repositories.get_bmi_trend(
            db,
            user_id
        )

        workout_weekly = await repositories.get_workout_weekly(
            db,
            user_id
        )

        muscle_distribution = await repositories.get_muscle_distribution(
            db,
            user_id
        )

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
                {
                    "month": row["month"],
                    "bmi": row["bmi"]
                }
                for row in bmi_trend
            ],

            "workout_weekly": [
                {
                    "week": f"W{row['week']}",
                    "sessions": row["sessions"]
                }
                for row in workout_weekly
            ],

            "calories_weekly": [],  # có thể bổ sung sau

            "muscle_distribution": [
                {
                    "name": row["muscle_group"],
                    "value": row["value"]
                }
                for row in muscle_distribution
            ]
        }

    except Exception as e:
        raise ValueError(e)