#
# ===== nơi setup logging =====
#
import logging
from backend.config.logging import setup_logging
from backend.modules.platform.schemas import InputCreatePostSchema
setup_logging()
logger = logging.getLogger(__name__)

#
# ===== nơi import thư viện =======
#
import asyncio
import sys

from backend.modules.ai.ai_assistant_service.app.ai import AIAssistantService
from backend.modules.ai.ai_assistant_service.app.config.settings import get_llm
from backend.modules.user.services import get_user_by_email_service
from backend.config.database import SessionLocal

#
#
#
async def main():
    sys.stdin.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')
    
    ai_service = AIAssistantService(
        option="key",
        # name_local="qwen2.5:7b",
        temperature=0.1,
    )

    user_input = input("Câu hỏi: ")

    result = await ai_service.run_pipline(
        user_input
    )

    logger.info(result)


if __name__ == "__main__":
    asyncio.run(main())