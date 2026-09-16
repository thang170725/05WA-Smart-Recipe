#
# ====== nơi import thư viện ======
#
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from backend.modules.workout.schemas import ( 
    OutputGetWorkoutProgramTemplatesSchema,
    OutputGetWorkoutProgramTemplateDetailSchema,
    InputPostWorkoutProgramTemplateDetailToWeekSchema,
    InputInsertExercisesRequest,
    InputUpdateActiveDurationSecondsSchema,
    InputUpdateWorkSetCompletedSchema
)
from backend.modules.account.dependencies import get_current_user
from backend.config.database import get_db
from backend.modules.user.models import User
from backend.modules.workout.services import (
    get_service, update_service, remove_service
)

router = APIRouter(prefix="/workout", tags=["Workout"])

# =====================
# ======= GET =========
# =====================
# lấy thư viện bài tập dựa vào category_name
@router.get("/get-exercises-library")
async def get_exercises_library(
    category_name: str,
    db: AsyncSession = Depends(get_db)
):
    return await get_service.get_exercises_library_service(db, category_name)

# API lấy thư viện chương trình tập mẫu
@router.get("/get-workout-program-templates", response_model=list[OutputGetWorkoutProgramTemplatesSchema])
async def get_workout_program_templates(
    db: AsyncSession = Depends(get_db)
):
    return await get_service.get_workout_program_templates_service(db)

# API lấy chi tiết 1 chương trình tập mẫu
@router.get("/get-workout-program-template-detail", response_model=OutputGetWorkoutProgramTemplateDetailSchema)
async def get_workout_program_templates(
    program_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await get_service.get_workout_program_template_detail_service(db, program_id)

# API lấy lịch bài tập trong 1 ngày bằng plan_date
@router.get("/get-exercises-list")
async def get_exercises_list(
    plan_date: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_service.get_exercises_list_service(db, current_user.id, plan_date)

@router.get("/get-total-calories-in-week")
async def get_total_calories_in_week(
    week_start: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_service.get_total_exercise_calories_service(db, current_user.id, week_start)

# ========= POST ===========
@router.post("/post-workout-program-template-detail-to-week")
async def post_workout_program_template_detail_to_week(
    request: InputPostWorkoutProgramTemplateDetailToWeekSchema,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):

    await update_service.post_workout_program_template_detail_to_week_service(
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
async def insert_exercises_by_id(
    payload: InputInsertExercisesRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await update_service.insert_exercises_service(db, current_user.id, payload.selected_exercises, payload.plan_date, payload.week_start)
    return res

# lưu active_duration_seconds, started_at, ended_at
@router.post("/update-active-duration-seconds")
async def update_active_duration_seconds(
    payload: InputUpdateActiveDurationSecondsSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await update_service.update_active_duration_seconds_service(db, current_user.id, payload.workout_plan_item_id, payload.started_at, payload.ended_at, payload.active_duration_seconds)

# chức năng update completed khi user đã hoàn thành set tập
@router.post("/update-workout-set-completed")
async def update_workout_set_completed(
    payload: InputUpdateWorkSetCompletedSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await update_service.update_workout_set_completed_service(
        db, 
        current_user.id, 
        payload.workout_set_id,
        payload.completed_reps
    )

# 
# ========= REMOVE =========
#
@router.delete("/delete-workout")
async def delete_workout(
    workout_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await remove_service.remove_workout_servie(db, current_user.id, workout_id)