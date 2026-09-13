#
# ===== nơi import thư viện =====
#
from math import e

from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.workout.repositories import (
    get_repository, update_repository, create_repository, insert_repository
)

from datetime import datetime, timedelta, date


async def apply_program(
    db: AsyncSession,
    user,
    slug: str
):
    try:
        # 1️⃣ Tìm program
        program = await get_repository.get_program_by_slug(
            db,
            slug
        )

        if not program:
            raise HTTPException(
                status_code=404,
                detail="Workout program not found"
            )

        # 2️⃣ Check user có active program chưa
        active_program = await get_repository.get_active_program_of_user(
            db,
            user.id
        )

        if active_program:
            raise HTTPException(
                status_code=400,
                detail="You already have an active program"
            )

        # 3️⃣ Tạo active program
        user_program = await create_repository.create_user_active_program(
            db=db,
            user_id=user.id,
            program_id=program.id,
            duration_days=program.duration_days
        )

        return {
            "program_name": program.name,
            "start_date": user_program.start_date,
            "end_date": user_program.end_date,
            "status": user_program.status
        }

    except Exception as e:
        await db.rollback()
        raise e


async def apply_program(
    db: AsyncSession,
    user,
    slug: str
):
    try:
        program = await get_repository.get_program_by_slug(
            db,
            slug
        )

        if not program:
            raise HTTPException(
                status_code=404,
                detail="Workout program not found"
            )

        active_program = await get_repository.get_active_program_of_user(
            db,
            user.id
        )

        if active_program:
            raise HTTPException(
                status_code=400,
                detail="You already have an active program"
            )

        user_program = await create_repository.create_user_active_program(
            db=db,
            user_id=user.id,
            program_id=program.id,
            duration_days=program.duration_days
        )

        return {
            "success": True,
            "message": "Apply program successfully",
            "data": {
                "active_program_id": user_program.id,
                "program_id": program.id,
                "program_name": program.name,
                "start_date": user_program.start_date,
                "end_date": user_program.end_date,
                "total_days": program.duration_days
            }
        }

    except Exception as e:
        await db.rollback()
        raise e


# Write
# ghi chương trình tập vào lịch tập của user khi user chọn
async def post_workout_program_template_detail_to_week_service(
    db: AsyncSession,
    user_id,
    current_date,
    week_start,
    program_detail
):
    try:
        start_date = datetime.strptime(
            current_date,
            "%Y-%m-%d"
        )

        for day in program_detail.days:
            plan_date = start_date + timedelta(
                days=day.day - 1
            )

            # tạo workout plan
            workout_plan_id = await create_repository.create_workout_plan_repo(
                db,
                user_id,
                plan_date.date(),
                week_start
            )

            # nếu rest day
            if not day.exercises:
                continue

            items = []

            for ex in day.exercises:
                items.append({
                    "workout_plan_id": workout_plan_id,
                    "exercise_id": ex.exercise_id,
                    "sets": ex.sets,
                    "reps": ex.reps,
                    "duration_minutes": ex.duration_minutes,
                    "order_index": ex.order_index
                })

            await create_repository.create_workout_plan_items_repo(
                db,
                items
            )

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise e


# ==============================
# ======= INSERT / POST ========
# ==============================

async def insert_exercises_service(
    db: AsyncSession,
    user_id: int,
    selected_exercises: list,
    plan_date,
    week_start
):
    try:
        await insert_repository.insert_exercises_repo(
            db,
            user_id,
            selected_exercises,
            plan_date,
            week_start
        )

        await db.commit()

        return "success"


    except Exception as e:
        await db.rollback()
        raise e


# lưu active_duration_seconds, started_at, ended_at
async def update_active_duration_seconds_service(
    db: AsyncSession,
    user_id,
    workout_plan_item_id,
    started_at,
    ended_at,
    active_duration_seconds
):
    try:
        workout_plan_item = await update_repository.update_active_duration_seconds_repo(
            db,
            user_id,
            workout_plan_item_id,
            started_at,
            ended_at,
            active_duration_seconds
        )

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise e


# chức năng update completed khi user đã hoàn thành set tập
async def update_workout_set_completed_service(
    db: AsyncSession,
    user_id,
    workout_set_id,
    completed_reps
):
    try:
        workout_sets = await update_repository.update_workout_set_completed_repo(
            db,
            user_id,
            workout_set_id,
            completed_reps
        )

        await db.commit()

        await db.refresh(
            workout_sets
        )

    except Exception as e:
        await db.rollback()
        raise e