from dotenv import load_dotenv
import os

from sqlalchemy import (
    create_engine,
    select
)
from sqlalchemy.orm import sessionmaker

from backend.modules.user.models import User
from backend.modules.user.services import UserService
from backend.modules.meals.services import MealService
from backend.modules.platform.service import PlatformService
from backend.modules.workout.services import WorkoutService

from backend.modules.meals.reponsitories import MealRepository
from backend.modules.workout.repositories import WorkoutRepo

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', default=None)
# print(DATABASE_URL)
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

db = SessionLocal()

workout = WorkoutService()
print(workout.get_exercises_list_service(db, 15, '2026-06-27'))

db.close()