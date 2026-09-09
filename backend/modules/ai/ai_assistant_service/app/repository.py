#
#
#
from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.ai.ai_assistant_service.app.models import AIToolRegistryModel
#
# 
# 
async def get_ai_tool_repository(db: AsyncSession):
    data = await db.execute(
        select(AIToolRegistryModel)
    )

    return data.scalars().all()