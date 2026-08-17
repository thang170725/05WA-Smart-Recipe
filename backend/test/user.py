from backend.config.logger import setup_logging
setup_logging()

import logging
logger = logging.getLogger(__name__)
import asyncio

from backend.config.database import SessionLocal
from backend.modules.account.repositories import check_email_repo 
from backend.modules.account.services import check_email_service

async def test_check_email():
    async with SessionLocal() as db:
        result = await check_email_service(db, "lekhanhtoan@gmail.com")

        logger.info(f"Email exists: {result}")


if __name__ == "__main__":
    asyncio.run(test_check_email())