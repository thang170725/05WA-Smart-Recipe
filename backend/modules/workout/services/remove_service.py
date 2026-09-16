import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.workout.repositories import remove_repository

async def remove_workout_servie(db: AsyncSession, user_id, workout_id: int):
    try:
        workout = await remove_repository.remove_one_workout(db, user_id, workout_id)
        await db.commit()

        return workout.rowcount > 0
    except Exception as e:
        logger.error(f"remove_workout_servie: {e}")
        db.rollback()
        raise