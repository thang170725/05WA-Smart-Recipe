#
# ======= nơi import thư viện ======
# 
from backend.modules.workout.queries import get_loc_exercises_query

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import (
    text, and_, select, 
    func
)
from datetime import date, timedelta
from backend.modules.workout.models import (
    WorkoutProgram,
    UserActiveProgram,
    Exercise,
    WorkoutProgramDayItem,
    WorkoutProgramDay,
    WorkoutPlan,
    WorkoutPlanItem,
    ExerciseCategory,
    WorkoutSet
)
from backend.modules.meals.models import Category

#
#
#
# lấy thư viện bài tạp tập theo category name
async def get_exercises_library_repository(db: AsyncSession, category_name: str):
    result = await db.execute(
        select(
            Exercise.id,
            Exercise.name,
            Exercise.description,
            Exercise.muscle_group,
            Exercise.difficulty,
            Exercise.image_url,
        )
        .join(
            ExerciseCategory,
            ExerciseCategory.exercise_id == Exercise.id
        )
        .join(
            Category,
            Category.id == ExerciseCategory.category_id
        )
        .where(Category.name == category_name)
    )

    return result.mappings().all()


# lấy ra tên + id của các chương trình mẫu
async def get_workout_program_templates_repo(
    db: AsyncSession
):
    stmt = (
        select(
            WorkoutProgram.id,
            WorkoutProgram.name
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


# lấy ra chương trình chi tiết của 1 workout template bằng id
async def get_workout_program_template_detail_repo(
    db: AsyncSession,
    program_id
):
    stmt = (
        select(
            WorkoutProgramDay.day_number.label("day"),
            WorkoutProgramDay.title,
            Exercise.id.label("exercise_id"),
            Exercise.name,
            Exercise.muscle_group,
            Exercise.difficulty,
            Exercise.calories_per_minute,
            WorkoutProgramDayItem.sets,
            WorkoutProgramDayItem.reps,
            WorkoutProgramDayItem.duration_minutes,
            WorkoutProgramDayItem.order_index,
        )
        .outerjoin(
            WorkoutProgramDayItem,
            WorkoutProgramDayItem.program_day_id == WorkoutProgramDay.id
        )
        .outerjoin(
            Exercise,
            Exercise.id == WorkoutProgramDayItem.exercise_id
        )
        .where(
            WorkoutProgramDay.program_id == program_id
        )
        .order_by(
            WorkoutProgramDay.day_number,
            WorkoutProgramDayItem.order_index
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


# lấy lịch tập 1 ngày của user bằng plan_date
async def get_exercises_list_repo(
    db: AsyncSession,
    user_id: int,
    plan_date
):
    stmt = (
        select(
            Exercise.id.label("exercise_id"),
            Exercise.name.label("exercise_name"),
            Exercise.difficulty,
            Exercise.met,
            WorkoutPlanItem.id.label("workout_plan_item_id"),
            WorkoutPlanItem.started_at,
            WorkoutPlanItem.ended_at,
            WorkoutPlanItem.active_duration_seconds,
            WorkoutPlanItem.order_index,
            WorkoutSet.id.label("workout_set_id"),
            WorkoutSet.set_number,
            WorkoutSet.target_reps,
            WorkoutSet.completed_reps,
            WorkoutSet.target_weight_kg,
            WorkoutSet.completed_weight_kg
        )
        .select_from(WorkoutPlan)
        .join(
            WorkoutPlanItem,
            WorkoutPlanItem.workout_plan_id == WorkoutPlan.id
        )
        .join(
            Exercise,
            Exercise.id == WorkoutPlanItem.exercise_id
        )
        .outerjoin(
            WorkoutSet,
            WorkoutSet.workout_plan_item_id == WorkoutPlanItem.id
        )
        .where(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.plan_date == plan_date
        )
        .order_by(
            WorkoutPlanItem.order_index,
            WorkoutSet.set_number
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


# lấy ra lịch tập 1 ngày của user
async def get_day_program_repo(
    db: AsyncSession,
    user_id: int,
    plan_date: str
):
    stmt = (
        select(
            WorkoutPlan.week_start,
            WorkoutPlan.plan_date,
            Exercise.name.label("exercise_name"),
            Exercise.difficulty,
            Exercise.calories_per_minute,
            WorkoutPlanItem.sets,
            WorkoutPlanItem.reps,
            WorkoutPlanItem.duration_minutes,
            WorkoutPlanItem.order_index
        )
        .join(
            WorkoutPlanItem,
            WorkoutPlanItem.workout_plan_id == WorkoutPlan.id
        )
        .join(
            Exercise,
            Exercise.id == WorkoutPlanItem.exercise_id
        )
        .where(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.plan_date == plan_date
        )
        .order_by(
            WorkoutPlan.plan_date,
            WorkoutPlanItem.order_index
        )
    )

    result = await db.execute(stmt)

    return result.mappings().all()


async def get_pw(
    db: AsyncSession,
    slug
):
    result = await db.execute(
        text(get_loc_exercises_query()),
        {
            "slug": slug,
        }
    )

    rows = result.mappings().all()

    if not rows:
        raise ValueError("Program not found")

    program = {
        "name": rows[0]["workout_program_name"],
        "level": rows[0]["level"],
        "duration_days": rows[0]["duration_days"],
        "days": {}
    }

    for row in rows:
        day_number = row["day_number"]

        if day_number not in program["days"]:
            program["days"][day_number] = {
                "title": row["title"],
                "exercises": []
            }

        program["days"][day_number]["exercises"].append({
            "name": row["exercise_name"],  # nếu trùng alias phải rename
            "sets": row["sets"],
            "reps": row["reps"],
            "duration_minutes": row["duration_minutes"]
        })

    program["days"] = [
        {"day_number": k, **v}
        for k, v in sorted(program["days"].items())
    ]

    return program


async def get_program_by_slug(
    db: AsyncSession,
    slug: str
):
    result = await db.execute(
        select(WorkoutProgram)
        .where(
            WorkoutProgram.slug == slug
        )
    )

    return result.scalars().first()


async def get_active_program_of_user(
    db: AsyncSession,
    user_id: int
):
    result = await db.execute(
        select(UserActiveProgram)
        .where(
            and_(
                UserActiveProgram.user_id == user_id,
                UserActiveProgram.status == "active"
            )
        )
    )

    return result.scalars().first()


# tổng lượng calo đốt cháy theo tuần
async def get_total_exercise_calories_repo(
    db: AsyncSession,
    user_id: int,
    weight,
    week_start
):
    stmt = (
        select(
            func.coalesce(
                func.sum(
                    Exercise.met *
                    weight *
                    (WorkoutPlanItem.active_duration_seconds / 3600.0)
                ),
                0
            ).label("calories")
        )
        .select_from(WorkoutPlan)
        .join(
            WorkoutPlanItem,
            WorkoutPlanItem.workout_plan_id == WorkoutPlan.id
        )
        .join(
            Exercise,
            Exercise.id == WorkoutPlanItem.exercise_id
        )
        .where(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.week_start == week_start,
            WorkoutPlanItem.active_duration_seconds.isnot(None)
        )
    )

    result = await db.execute(stmt)

    total_calories = result.scalar()

    return round(total_calories, 2)

async def get_program_by_id(db: AsyncSession, program_id: int):
    program = await db.execute(WorkoutProgram).where(WorkoutProgram.id == program_id)

    return program.first()
        