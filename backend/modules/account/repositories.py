from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists
from backend.modules.user import models 

async def check_email_repo(db: AsyncSession, email:str):
    stmt = select(
        exists().where(models.User.email == email)
    )

    result = await db.execute(stmt)

    return result.scalar()