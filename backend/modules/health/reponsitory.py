from backend.modules.user.models import User

def update_health_profile(db, user_id, bmi, body_fat, health_note):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise ValueError("User not found")

    user.bmi = bmi
    user.body_fat = body_fat
    user.health_note = health_note

    db.commit()
    return user
