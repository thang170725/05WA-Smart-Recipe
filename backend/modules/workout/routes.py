from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.modules.workout.schemas import ( 
    OutputExercisesShema,
    OutputGetWorkoutProgramTemplatesSchema,
    OutputGetWorkoutProgramTemplateDetailSchema,
    InputPostWorkoutProgramTemplateDetailToWeekSchema,
    OutputGetWeekProgram
)
from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db
from backend.modules.workout.services import WorkoutService
from backend.modules.user.models import User

router = APIRouter(prefix="/workout", tags=["Workout"])
service = WorkoutService()

# ======= GET =======
# API lấy thư viện bài tập
@router.get("/get-exercises-library", response_model=list[OutputExercisesShema])
def get_exercises_library(
    db: Session = Depends(get_db)
):
    return service.get_exercises_lib_service(db)

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

# API lấy lịch bài tập trong 1 tuần
@router.get("/get-week-programs", response_model=OutputGetWeekProgram)
def get_week_programs(
    week_start: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.get_week_programs_service(db, current_user.id, week_start)

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