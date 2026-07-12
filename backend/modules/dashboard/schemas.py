from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# ===========================
# ======= USER INFOR ======== 
# ===========================
class OutputUserInforSchema(BaseModel):
    fullname: Optional[str] = None
    target_goal: Optional[str]
    activity_level: Optional[str]
    
    health_status: Optional[str] = None
    weight: Optional[float]
    height: Optional[float]

    bmi: Optional[float] = None
    bmr: Optional[float] = None
    tdee: Optional[float] = None
    

# ====== HEALTH HISTORY =======
class OutputGethealthHistorySchema(BaseModel):
    month: str
    bmi_avarage: float

# =============================
# STATS
# =============================

class StatsSchema(BaseModel):
    total_meal_plans: Optional[int] = None
    completed_workouts: Optional[int] = None
    total_posts: Optional[int] = None
    total_comments: Optional[int] = None


# =============================
# TREND DATA
# =============================

class BmiTrendSchema(BaseModel):
    month: Optional[str] = None
    bmi: Optional[float] = None


class WorkoutWeeklySchema(BaseModel):
    week: Optional[str] = None
    sessions: Optional[int] = None


class CaloriesWeeklySchema(BaseModel):
    week: Optional[str] = None
    calories: Optional[float] = None


class MuscleDistributionSchema(BaseModel):
    name: Optional[str] = None
    value:Optional[int] = None