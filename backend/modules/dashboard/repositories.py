from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import func, select

from backend.modules.user.models import User

from backend.modules.meals.models import MealPlan, MealPlanItem, Meal, HealthHistory, HealthMetric

from backend.modules.workout.models import WorkoutPlan, WorkoutPlanItem, Exercise

from backend.modules.platform.models import Platform, Comment


async def get_user_infor_repo(
    db: AsyncSession,
    user_id: int
):
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
        .join(
            HealthMetric,
            HealthMetric.user_id == User.id
        )
        .where(User.id == user_id)
    )

    result = await db.execute(stmt)

    return result.mappings().first()


# PROFILE + HEALTH

async def get_health_history_repo(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(
            HealthHistory.month,
            HealthHistory.bmi_avarage
        )
        .where(HealthHistory.user_id == user_id)
    )

    result = await db.execute(stmt)

    return result.mappings().all()


async def get_latest_health(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(HealthMetric)
        .where(HealthMetric.user_id == user_id)
        .order_by(HealthMetric.recorded_at.desc())
        .limit(1)
    )

    result = await db.execute(stmt)

    return result.scalar_one_or_none()


# =============================
# STATS
# =============================

async def count_meal_plans(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(func.count(MealPlan.id))
        .where(MealPlan.user_id == user_id)
    )

    result = await db.execute(stmt)

    return result.scalar()


async def count_completed_workouts(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(func.count(WorkoutPlan.id))
        .where(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.status == "completed"
        )
    )

    result = await db.execute(stmt)

    return result.scalar()


async def count_posts(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(func.count(Platform.id))
        .where(Platform.user_id == user_id)
    )

    result = await db.execute(stmt)

    return result.scalar()


async def count_comments(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(func.count(Comment.id))
        .where(Comment.user_id == user_id)
    )

    result = await db.execute(stmt)

    return result.scalar()


# =============================
# BMI TREND
# =============================

async def get_bmi_trend(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(
            func.date_format(
                HealthMetric.recorded_at,
                "%Y-%m"
            ).label("month"),
            HealthMetric.bmi
        )
        .where(HealthMetric.user_id == user_id)
        .order_by(HealthMetric.recorded_at.asc())
    )

    result = await db.execute(stmt)

    return result.mappings().all()


# =============================
# WORKOUT WEEKLY
# =============================

async def get_workout_weekly(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(
            func.week(
                WorkoutPlan.plan_date
            ).label("week"),
            func.count(
                WorkoutPlan.id
            ).label("sessions")
        )
        .where(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.status == "completed"
        )
        .group_by(
            func.week(WorkoutPlan.plan_date)
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


# =============================
# MUSCLE DISTRIBUTION
# =============================

async def get_muscle_distribution(
    db: AsyncSession,
    user_id: int
):
    stmt = (
        select(
            Exercise.muscle_group,
            func.count(
                WorkoutPlanItem.id
            ).label("value")
        )
        .join(
            Exercise,
            Exercise.id == WorkoutPlanItem.exercise_id
        )
        .join(
            WorkoutPlan,
            WorkoutPlan.id == WorkoutPlanItem.workout_plan_id
        )
        .where(
            WorkoutPlan.user_id == user_id
        )
        .group_by(
            Exercise.muscle_group
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()