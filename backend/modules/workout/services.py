from fastapi import HTTPException
from sqlalchemy.orm import Session
from collections import defaultdict
from backend.modules.workout.repositories import WorkoutRepo
from datetime import datetime, timedelta

class WorkoutService:
    def __init__(self):
        self.repo = WorkoutRepo()
    
    # READ
    def get_program_workout(self, db, slug):
        return self.repo.get_pw(db, slug)
    
    # lấy ra thư viện bài tập
    def get_exercises_lib_service(self, db):
        return self.repo.get_exercises_lib_repo(db)
    
    # lấy tên + id của các chương trình mẫu
    def get_workout_program_templates_service(self, db):
        return self.repo.get_workout_program_templates_repo(db)
    
    # lấy ra chương trình chi tiết của 1 workout template bằng id
    def get_workout_program_template_detail_service(self, db, program_id):
        rows = self.repo.get_workout_program_template_detail_repo(db, program_id)

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

        days = sorted(days_map.values(), key=lambda x: x["day"])

        return {
            "id": program_id,
            "days": days
        }
    
    # lấy ra lịch tập 1 tuần của user và format dạng mà UI có thể hiển thị
    def get_week_programs_service(self, db, user_id, week_start):
        rows = self.repo.get_week_program_repo(db, user_id, week_start)

        def format_data(rows, week_start):
            week_menu = {
                "Mon": [],
                "Tue": [],
                "Wed": [],
                "Thu": [],
                "Fri": [],
                "Sat": [],
                "Sun": []
            }

            for row in rows:
                plan_date = row["plan_date"]

                # convert date -> weekday string
                weekday = datetime.strptime(str(plan_date), "%Y-%m-%d").strftime("%a")

                exercise = {
                    "name": row["exercise_name"],
                    "difficulty": row["difficulty"],
                    "calories_per_minute": row["calories_per_minute"],
                    "sets": row["sets"],
                    "reps": row["reps"],
                    "duration_minutes": row["duration_minutes"],
                    "order_index": row["order_index"]
                }

                if weekday in week_menu:
                    week_menu[weekday].append(exercise)

            return {
                "week_start": str(week_start),
                "week_menu": week_menu
            }

        return format_data(rows, week_start)
    
    def apply_program(self, db: Session, user, slug: str):

        # 1️⃣ Tìm program
        program = self.repo.get_program_by_slug(db, slug)
        if not program:
            raise HTTPException(
                status_code=404,
                detail="Workout program not found"
            )

        # 2️⃣ Check user có active program chưa
        active_program = self.repo.get_active_program_of_user(
            db,
            user.id
        )

        if active_program:
            raise HTTPException(
                status_code=400,
                detail="You already have an active program"
            )

        # 3️⃣ Tạo active program
        user_program = self.repo.create_user_active_program(
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
    
    def apply_program(self, db: Session, user, slug: str):

        program = self.repo.get_program_by_slug(db, slug)
        if not program:
            raise HTTPException(
                status_code=404,
                detail="Workout program not found"
            )
    
        active_program = self.repo.get_active_program_of_user(
            db,
            user.id
        )
    
        if active_program:
            raise HTTPException(
                status_code=400,
                detail="You already have an active program"
            )
    
        user_program = self.repo.create_user_active_program(
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
    
    # Write
    # ghi chương trình tập vào lịch tập của user khi user chọn
    def post_workout_program_template_detail_to_week_service(
        self,
        db,
        user_id,
        current_date,
        week_start,
        program_detail
    ):

        start_date = datetime.strptime(current_date, "%Y-%m-%d")

        for day in program_detail.days:

            plan_date = start_date + timedelta(days=day.day - 1)

            # tạo workout plan
            workout_plan_id = self.repo.create_workout_plan_repo(
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

            self.repo.create_workout_plan_items_repo(db, items)

        db.commit()