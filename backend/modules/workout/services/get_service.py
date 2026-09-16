import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

from math import e

from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.workout.repositories import get_repository

from datetime import datetime, timedelta, date

from backend.config.formula import calc_calories_by_met

#
#
#
# lấy ra thư viện bài tập dựa vào category_name
async def get_exercises_library_service(
    db: AsyncSession,
    category_name: str
):
    try:
        return await get_repository.get_exercises_library_repository(
            db,
            category_name
        )

    except Exception as e:
        await db.rollback()
        raise e

async def get_program_workout(
    db: AsyncSession,
    slug
):
    try:
        return await get_repository.get_pw(
            db,
            slug
        )

    except Exception as e:
        await db.rollback()
        raise e

# lấy tên + id của các chương trình mẫu
async def get_workout_program_templates_service(
    db: AsyncSession
):
    try:
        return await get_repository.get_workout_program_templates_repo(
            db
        )

    except Exception as e:
        await db.rollback()
        raise e


# lấy ra chương trình chi tiết của 1 workout template bằng id
async def get_workout_program_template_detail_service(
    db: AsyncSession,
    program_id
):
    try:
        rows = await get_repository.get_workout_program_template_detail_repo(
            db,
            program_id
        )

        days_map = {}

        for row in rows:
            day_number = row["day"]

            if day_number not in days_map:
                days_map[day_number] = {
                    "day": day_number,
                    "title": row["title"],
                    "exercises": []
                }

            # nếu không phải rest day
            if row["name"] is not None:
                days_map[day_number]["exercises"].append({
                    "exercise_id": row["exercise_id"],
                    "name": row["name"],
                    "muscle_group": row["muscle_group"],
                    "difficulty": row["difficulty"],
                    "calories_per_minute": row["calories_per_minute"],
                    "sets": row["sets"],
                    "reps": row["reps"],
                    "duration_minutes": row["duration_minutes"],
                    "order_index": row["order_index"],
                })

        days = sorted(
            days_map.values(),
            key=lambda x: x["day"]
        )

        return {
            "id": program_id,
            "days": days
        }

    except Exception as e:
        await db.rollback()
        raise e


# lấy ra lịch tập 1 ngày của user bằng plan_date
async def get_exercises_list_service(
    db: AsyncSession,
    user_id: int,
    plan_date: date
):
    try:
        rows = await get_repository.get_exercises_list_repo(
            db,
            user_id,
            plan_date
        )

        exercises = {}

        for row in rows:
            workout_plan_id = row["workout_plan_id"]
            workout_plan_item_id = row["workout_plan_item_id"]

            exercise = exercises.get(
                workout_plan_item_id
            )

            if exercise is None:
                exercise = {
                    "workout_plan_id": workout_plan_id,
                    "workout_plan_item_id": workout_plan_item_id,
                    "exercise_id": row["exercise_id"],
                    "exercise_name": row["exercise_name"],
                    "difficulty": row["difficulty"],
                    "met": row["met"],
                    "started_at": row["started_at"],
                    "ended_at": row["ended_at"],
                    "active_duration_seconds": row["active_duration_seconds"],
                    "order_index": row["order_index"],
                    "sets": []
                }

                exercises[workout_plan_item_id] = exercise

            exercise["sets"].append(
                {
                    "workout_set_id": row["workout_set_id"],
                    "set_number": row["set_number"],
                    "target_reps": row["target_reps"],
                    "completed_reps": row["completed_reps"],
                    "target_weight_kg": row["target_weight_kg"],
                    "completed_weight_kg": row["completed_weight_kg"],
                }
            )

        return list(
            exercises.values()
        )

    except Exception as e:
        await db.rollback()
        raise e


async def get_total_exercise_calories_service(db, user_id, week_start):
    try:
        workout_plans = await get_repository.get_total_exercise_calories_repository(db, user_id, week_start)
        total_calories = 0
        for workout_plan in workout_plans:
            met = float(workout_plan['met'] or 0)
            total_active_duration_seconds = float(workout_plan['total_active_duration_seconds'] or 0)
            weight = float(workout_plan['current_weight'])

            total_calories += calc_calories_by_met(met, weight, total_active_duration_seconds)
        
        return {'total_calories': total_calories}

    except Exception as e:
        logger.debug(f"get_total_exercise_calories_service: {e}")
        await db.rollback()
        raise e
