from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from backend.config.database import get_db
from backend.modules.user.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config.settings import SECRET_KEY, ALGORITHM
from sqlalchemy import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = int(user_id)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.execute(
        select(User).where(User.id == user_id)
    )
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user.scalar_one_or_none()