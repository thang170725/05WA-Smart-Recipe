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


# ==============================
# ======= INSERT / POST ========
# ==============================




# lưu active_duration_seconds, started_at, ended_at
async def update_active_duration_seconds_repo(
    db: AsyncSession,
    user_id,
    workout_plan_item_id,
    started_at,
    ended_at,
    active_duration_seconds
):
    result = await db.execute(
        select(WorkoutPlanItem)
        .where(
            WorkoutPlanItem.id == workout_plan_item_id,
        )
    )

    workout_plan_item = result.scalar_one_or_none()

    if workout_plan_item is None:
        return

    workout_plan_item.started_at = started_at
    workout_plan_item.ended_at = ended_at
    workout_plan_item.active_duration_seconds = active_duration_seconds

    return workout_plan_item


# chức năng update completed khi user đã hoàn thành set tập
async def update_workout_set_completed_repo(
    db: AsyncSession,
    user_id,
    workout_set_id,
    completed_reps
):
    stmt = select(WorkoutSet).where(
        WorkoutSet.id == workout_set_id
    )

    result = await db.execute(stmt)

    workout_set = result.scalar_one_or_none()

    if workout_set is None:
        return None

    workout_set.completed_reps = completed_reps

    return workout_set