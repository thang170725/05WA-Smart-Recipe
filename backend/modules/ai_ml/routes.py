from backend.modules.ai_ml.schemas import ( 
    InputPostHealthFormSchema
)
from backend.modules.user.models import User
from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db
from backend.modules.ai_ml.services import AIMLService
from backend.config.settings import avatars_path
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

router = APIRouter(prefix="/ai", tags=["AI"])
ai_ml_service = AIMLService()

# ======= POST =======
# phân tích các chỉ số sức khỏe dựa vào form
@router.post('/post-health-form')
async def post_health_form(
    payload: InputPostHealthFormSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ai_ml_service.analyst_health_form(db, current_user.id, payload)