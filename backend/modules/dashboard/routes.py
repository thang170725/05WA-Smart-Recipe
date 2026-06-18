from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.modules.user.dependencies import get_current_user
from backend.modules.dashboard.schemas import (
    OutputUserInforSchema,
    OutputGethealthHistorySchema
)
from backend.modules.dashboard.services import DashboardService
from backend.modules.user.models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
service = DashboardService()

# ======= GET ========
# lấy thông tin người dùng render lên dashboard
@router.get("/get-user-infor", response_model=OutputUserInforSchema)
def get_user_infor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_user_infor_service(db, current_user.id)

# take out health history 
@router.get("/get-health-history", response_model=OutputGethealthHistorySchema)
def get_health_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_health_history_service(db, current_user.id)