from backend.modules.user.models import User
from backend.modules.health.models import HealthMetric

from sqlalchemy.orm import Session
from sqlalchemy import select

def update_health_profile(db, user_id, bmi, body_fat, health_note):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise ValueError("User not found")

    user.bmi = bmi
    user.body_fat = body_fat
    user.health_note = health_note

    db.commit()
    return user

class HealthMetricRepo:
    def __init__(self):
        ...
    
    # get all infor in helth_metrics table
    def get_health_metrics_info_repo(self, db: Session, user_id: int):
        stmt = select(HealthMetric).where(
            HealthMetric.user_id == user_id
        )

        return db.execute(stmt).scalars().first()