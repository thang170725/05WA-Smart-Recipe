from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.modules.workout.schemas import ( 
    OutputExercisesShema,
    OutputGetWorkoutProgramTemplatesSchema,
    OutputGetWorkoutProgramTemplateDetailSchema,
    InputPostWorkoutProgramTemplateDetailToWeekSchema,
    OutputGetWeekProgram,
    InputInsertExercisesRequest,
    InputUpdateActiveDurationSecondsSchema
)
from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db
from backend.modules.workout.services import WorkoutService
from backend.modules.user.models import User

from datetime import date

router = APIRouter(prefix="/workout", tags=["Workout"])
service = WorkoutService()

# =====================
# ======= GET =========
# =====================
# lấy thư viện bài tập dựa vào category_name
@router.get("/get-exercises-library", response_model=list[OutputExercisesShema])
def get_exercises_library(
    category_name: str,
    db: Session = Depends(get_db)
):
    return service.get_exercises_lib_service(db, category_name)

# API lấy thư viện chương trình tập mẫu
@router.get("/get-workout-program-templates", response_model=list[OutputGetWorkoutProgramTemplatesSchema])
def get_workout_program_templates(
    db: Session = Depends(get_db)
):
    return service.get_workout_program_templates_service(db)

# API lấy chi tiết 1 chương trình tập mẫu
@router.get("/get-workout-program-template-detail", response_model=OutputGetWorkoutProgramTemplateDetailSchema)
def get_workout_program_templates(
    program_id: int,
    db: Session = Depends(get_db)
):
    return service.get_workout_program_template_detail_service(db, program_id)

# API lấy lịch bài tập trong 1 ngày bằng plan_date
@router.get("/get-exercises-list")
def get_exercises_list(
    plan_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.get_exercises_list_service(db, current_user.id, plan_date)

# ========= POST ===========
@router.post("/post-workout-program-template-detail-to-week")
def post_workout_program_template_detail_to_week(
    request: InputPostWorkoutProgramTemplateDetailToWeekSchema,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    service.post_workout_program_template_detail_to_week_service(
        db,
        user.id,
        request.current_date,
        request.week_start,
        request.workout_program_template_detail
    )

    return "success"

# =============================
# ======= INSERT/POST =========
# =============================
# thêm bài tập vào schedule của user bằng plan_date
@router.post("/insert-exercises")
def insert_exercises_by_id(
    payload: InputInsertExercisesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = service.insert_exercises_service(db, current_user.id, payload.selected_exercises, payload.plan_date, payload.week_start)
    return res

# lưu active_duration_seconds, started_at, ended_at
@router.post("/update-active-duration-seconds")
def update_active_duration_seconds(
    payload: InputUpdateActiveDurationSecondsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.update_active_duration_seconds_service(db, current_user.id, payload.workout_plan_item_id, payload.started_at, payload.ended_at, payload.active_duration_seconds)