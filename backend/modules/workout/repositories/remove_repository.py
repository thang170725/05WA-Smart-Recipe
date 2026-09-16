from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.workout.models import WorkoutPlan
from backend.modules.meals.models import Category

async def remove_one_workout(db: AsyncSession, user_id, workout_id):
    workout = await db.execute(delete(WorkoutPlan).where(WorkoutPlan.id == workout_id, WorkoutPlan.user_id == user_id))
    return workout