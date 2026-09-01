#
# ======== nơi import thư viện =======
#
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config.database import get_db
from backend.modules.account.dependencies import get_current_user
from backend.modules.dashboard.schemas import (
    OutputUserInforSchema,
    OutputGethealthHistorySchema
)
from backend.modules.dashboard import services
from backend.modules.user.models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
# ======= GET ========
# lấy thông tin người dùng render lên dashboard
@router.get("/get-user-infor", response_model=OutputUserInforSchema)
async def get_user_infor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await services.get_user_infor_service(db, current_user.id)

# take out health history 
@router.get("/get-health-history", response_model=OutputGethealthHistorySchema)
async def get_health_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await services.sget_health_history_service(db, current_user.id)