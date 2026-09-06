from backend.config.database import SessionLocal

from backend.modules.meals.repositories.get_repository import get_foods_library_repository


async def test():

    async with SessionLocal() as db:

        data = await get_foods_library_repository(db)

        print(data)


import asyncio

asyncio.run(test())