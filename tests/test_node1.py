#
# ===== nơi import logging =====
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
#
#
import asyncio

from backend.modules.ai.ai_assistant_service.app.ai import AIAssistantService

ai_agent = AIAssistantService(
    option="local",
    name_local='qwen2.5b:3b'
)

async def main ():
    data = await ai_agent.run_pipline("protein là gì?")
    logger.debug(data)

if __name__ == "__main__":
    asyncio.run(main())