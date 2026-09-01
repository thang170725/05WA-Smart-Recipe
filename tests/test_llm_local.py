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
from backend.modules.ai.ai_assistant_service.app.ai import AIAssistantService
from backend.modules.ai.ai_assistant_service.app.config.settings import get_llm

#
#
#
async def main():


    ai_service = AIAssistantService(
        option="local",
        name_local="qwen2.5:7b",
        temperature=0.1,
    )

    user_input = input("Câu hỏi: ")

    result = await ai_service.run_pipline(
        user_input
    )

    logger.info(result)


if __name__ == "__main__":
    asyncio.run(main())