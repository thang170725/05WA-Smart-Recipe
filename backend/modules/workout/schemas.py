from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date

# INPUT
class InputProgramWorkout(BaseModel):
    slug: str

class InputApplyProgram(BaseModel):
    slug: str

# ===================
# === chức năng lấy các bài tập trong thư viện bằng category_name ===
# ===================
class OutputExercisesShema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    muscle_group: str
    calories_per_minute: float
    difficulty: str
    image_url: str

# output lấy tên thư viện chương trình bài tập mẫu (name + id)
class OutputGetWorkoutProgramTemplatesSchema(BaseModel):
   id: int
   name: str

# output lấy chi tiết chương trình bài tập mẫu
class Exercises(BaseModel):
    exercise_id: Optional[int] | None = None
    name: Optional[str] | None = None
    muscle_group: Optional[str] | None = None
    difficulty: Optional[str] | None = None
    calories_per_minute: Optional[float] | None = None
    sets: Optional[int] | None = None
    reps: Optional[int] | None = None
    duration_minutes: Optional[float] | None = None
    order_index: Optional[int] | None = None
class Days(BaseModel):
    day: int
    title: str
    exercises: List[Exercises]
class OutputGetWorkoutProgramTemplateDetailSchema(BaseModel):
    id: int
    days: List[Days]

# output lấy lịch tập 1 tuần
class ExerciseItem(BaseModel):
    name: str
    difficulty: str
    calories_per_minute: float
    sets: int
    reps: int
    duration_minutes: Optional[int] = None
    order_index: int
class WeekMenuSchema(BaseModel):
    Mon: List[ExerciseItem]
    Tue: List[ExerciseItem]
    Wed: List[ExerciseItem]
    Thu: List[ExerciseItem]
    Fri: List[ExerciseItem]
    Sat: List[ExerciseItem]
    Sun: List[ExerciseItem]
class OutputGetWeekProgram(BaseModel):
    week_start: str
    week_menu: WeekMenuSchema

# Input
# để ghi vào db lịch tập của 1 user
class InputPostWorkoutProgramTemplateDetailToWeekSchema(BaseModel):
    current_date: str
    week_start: str
    workout_program_template_detail: OutputGetWorkoutProgramTemplateDetailSchema

class ExerciseInput(BaseModel):
    exercise_id: int
    sets: int
    reps: int
    duration_minutes: int
    order_index: int

class InsertExercisesRequest(BaseModel):
    plan_date: date
    week_start: date
    selected_exercises: list[ExerciseInput]