from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.modules.ingredients.schemas import IngredientsSchema
from backend.modules.user.models import User
from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db

router = APIRouter(prefix="/user", tags=["AnalyticsIngredients"])


@router.post("/analytics-ingredients")
def analytics_ingredients(
    payload: IngredientsSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(payload.ingredients)
