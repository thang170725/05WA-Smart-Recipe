#
#
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
#
#
import asyncio

from backend.config.database import SessionLocal
from backend.modules.ai.ai_assistant_service.app.repository import get_ai_tool_repository

#
#
#
async def main():
    async with SessionLocal() as db:
        data = await get_ai_tool_repository(db)
        logger.debug(len(data[0].embedding)) # 1024

if __name__ == "__main__":
    asyncio.run(main())