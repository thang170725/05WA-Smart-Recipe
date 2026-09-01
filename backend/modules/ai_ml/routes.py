from backend.modules.ai_ml.schemas import ( 
    InputPostHealthFormSchema
)
from backend.modules.user.models import User
from backend.modules.account.dependencies import get_current_user
from backend.config.database import get_db
from backend.modules.ai_ml import services
from backend.config.settings import avatars_path
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/ai", tags=["AI"])

# ======= POST =======
# phân tích các chỉ số sức khỏe dựa vào form
@router.post('/post-health-form')
async def post_health_form(
    payload: InputPostHealthFormSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await services.analyst_health_form_service(db, current_user.id, payload)