#
# ======= nơi import thư viện ======
# 
from backend.modules.workout.queries import get_loc_exercises_query

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import (
    text, and_, select, 
    func, insert
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
async def create_user_active_program(
    db: AsyncSession,
    user_id: int,
    program_id: int,
    duration_days: int
):
    start_date = date.today()

    end_date = start_date + timedelta(
        days=duration_days
    )

    user_program = UserActiveProgram(
        user_id=user_id,
        program_id=program_id,
        start_date=start_date,
        end_date=end_date,
        status="active"
    )

    db.add(user_program)

    await db.commit()

    await db.refresh(user_program)

    return user_program


# Create
# tạo workout plan
async def create_workout_plan_repo(
    db: AsyncSession,
    user_id,
    plan_date,
    week_start
):
    stmt = insert(WorkoutPlan).values(
        user_id=user_id,
        plan_date=plan_date,
        week_start=week_start
    )

    result = await db.execute(stmt)

    return result.inserted_primary_key[0]


# tạo workout_plan_items
async def create_workout_plan_items_repo(
    db: AsyncSession,
    items
):
    stmt = insert(WorkoutPlanItem)

    await db.execute(
        stmt,
        items
    )