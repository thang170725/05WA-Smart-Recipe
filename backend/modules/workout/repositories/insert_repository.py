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

# thêm bài tập vào danh sách của người dùng
async def insert_exercises_repo(
    db: AsyncSession,
    user_id: int,
    selected_exercises: list,
    plan_date,
    week_start
):
    # 1. insert vào WorkPlan (lấy ra ngày tập luyện đó)
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.plan_date == plan_date
        )
    )

    workout_plan = result.scalar_one_or_none()

    if workout_plan is None:
        workout_plan = WorkoutPlan(
            user_id=user_id,
            plan_date=plan_date,
            week_start=week_start
        )

        db.add(workout_plan)

        await db.flush()

    # 2. insert vào workplanitem
    for order, exercise in enumerate(
        selected_exercises,
        start=1
    ):
        workout_item = WorkoutPlanItem(
            workout_plan_id=workout_plan.id,
            exercise_id=exercise.exercise_id,
            order_index=order
        )

        db.add(workout_item)

        await db.flush()

        # Insert Sets
        for set_number, rep in enumerate(
            exercise.reps,
            start=1
        ):
            workout_set = WorkoutSet(
                workout_plan_item_id=workout_item.id,
                set_number=set_number,
                target_reps=rep
            )

            db.add(workout_set)

    return workout_plan