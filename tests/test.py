from backend.config.database import SessionLocal

from backend.modules.workout.services.get_service import get_total_exercise_calories_service


async def test():

    async with SessionLocal() as db:

        data = await get_total_exercise_calories_service(db, 16, '2026-09-07', )

        print(data)


import asyncio

asyncio.run(test())