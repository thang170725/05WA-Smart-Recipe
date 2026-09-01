from backend.config.database import SessionLocal

from backend.modules.workout.repositories import get_repository


async def test():

    async with SessionLocal() as db:

        data = await get_repository.get_exercises_library_repository(db, 'chest')

        print(data)


import asyncio

asyncio.run(test())