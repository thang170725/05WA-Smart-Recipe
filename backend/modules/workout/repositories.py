from backend.modules.workout.queries import get_loc_exercises_query
from sqlalchemy.orm import Session
from sqlalchemy import text, and_, select, insert
from datetime import date, timedelta
from backend.modules.workout.models import (
    WorkoutProgram,
    UserActiveProgram,
    Exercise,
    WorkoutProgramDayItem,
    WorkoutProgramDay,
    WorkoutPlan,
    WorkoutPlanItem,
    ExerciseCategory
)
from backend.modules.meals.models import Category

class WorkoutRepo:
    # ===================
    # ====== GET ========
    # ===================
    # lấy ra thư viện bài tập dựa vào category_name
    def get_exercises_lib_repo(self, db: Session, category_name: str):
        stmt = (
            select(
                Exercise.id,
                Exercise.name,
                Exercise.description,
                Exercise.muscle_group,
                Exercise.calories_per_minute,
                Exercise.difficulty,
                Exercise.image_url,
            )
            .join(ExerciseCategory, ExerciseCategory.exercise_id == Exercise.id)
            .join(Category, Category.id == ExerciseCategory.category_id)
            .where(Category.name == category_name)
        )
        
        return db.execute(stmt).mappings().all()

    # lấy ra tên + id của các chương trình mẫu
    def get_workout_program_templates_repo(self, db):
        stmt = (
            select(
                WorkoutProgram.id,
                WorkoutProgram.name
            )
        )

        return db.execute(stmt).mappings().all()
    
    # lấy ra chương trình chi tiết của 1 workout template bằng id
    def get_workout_program_template_detail_repo(self, db, program_id):
        stmt = (
            select(
                WorkoutProgramDay.day_number.label("day"), 
                WorkoutProgramDay.title,   

                Exercise.id.label("exercise_id"),
                Exercise.name, 
                Exercise.muscle_group, 
                Exercise.difficulty, 
                Exercise.calories_per_minute,

                WorkoutProgramDayItem.sets, 
                WorkoutProgramDayItem.reps, 
                WorkoutProgramDayItem.duration_minutes, 
                WorkoutProgramDayItem.order_index,                
            )
            .outerjoin(
                WorkoutProgramDayItem, 
                WorkoutProgramDayItem.program_day_id == WorkoutProgramDay.id
            )
            .outerjoin(
                Exercise, 
                Exercise.id == WorkoutProgramDayItem.exercise_id
            )
            .where(WorkoutProgramDay.program_id == program_id)
            .order_by(
                WorkoutProgramDay.day_number, 
                WorkoutProgramDayItem.order_index
            )
        )

        return db.execute(stmt).mappings().all()
    
    # lấy lịch tập 1 ngày của user bằng plan_date
    def get_exercises_list_repo(self, db: Session, user_id: int, plan_date):
        stmt = (
            select(
                Exercise.name.label("exercise_name"),
                Exercise.difficulty,
                Exercise.calories_per_minute,

                WorkoutPlanItem.sets,
                WorkoutPlanItem.reps,
                WorkoutPlanItem.duration_minutes,
                WorkoutPlanItem.order_index
            )
            .join(WorkoutPlanItem, WorkoutPlanItem.exercise_id == Exercise.id)
            .join(WorkoutPlan, WorkoutPlan.id == WorkoutPlanItem.workout_plan_id)
            .where(
                WorkoutPlan.user_id == user_id, 
                WorkoutPlan.plan_date == plan_date
            )
            .order_by(WorkoutPlanItem.order_index)
        )

        return db.execute(stmt).mappings().all()
    
    # lấy ra lịch tập 1 ngày của user
    def get_day_program_repo(self, db: Session, user_id: int, plan_date: str):
        stmt = (
            select(
                WorkoutPlan.week_start,
                WorkoutPlan.plan_date,

                Exercise.name.label("exercise_name"),
                Exercise.difficulty,
                Exercise.calories_per_minute,

                WorkoutPlanItem.sets,
                WorkoutPlanItem.reps,
                WorkoutPlanItem.duration_minutes,
                WorkoutPlanItem.order_index
            )
            .join(WorkoutPlanItem, WorkoutPlanItem.workout_plan_id == WorkoutPlan.id)
            .join(Exercise, Exercise.id == WorkoutPlanItem.exercise_id)
            .where(
                WorkoutPlan.user_id == user_id, 
                WorkoutPlan.plan_date == plan_date
            )
            .order_by(WorkoutPlan.plan_date, WorkoutPlanItem.order_index)
        )

        return db.execute(stmt).mappings().all()

    def get_pw(self, db, slug):
        rows = db.execute(
            text(get_loc_exercises_query()),{
                "slug": slug,
            }
        ).mappings().all()

        if not rows:
            raise ValueError("Program not found")

        program = {
            "name": rows[0]["workout_program_name"],
            "level": rows[0]["level"],
            "duration_days": rows[0]["duration_days"],
            "days": {}
        }

        for row in rows:
            day_number = row["day_number"]

            if day_number not in program["days"]:
                program["days"][day_number] = {
                    "title": row["title"],
                    "exercises": []
                }

            program["days"][day_number]["exercises"].append({
                "name": row["exercise_name"],  # nếu trùng alias phải rename
                "sets": row["sets"],
                "reps": row["reps"],
                "duration_minutes": row["duration_minutes"]
            })

        program["days"] = [
            {"day_number": k, **v}
            for k, v in sorted(program["days"].items())
        ]
            
        return program
    
    def get_program_by_slug(self, db: Session, slug: str):
        return (
            db.query(WorkoutProgram)
            .filter(WorkoutProgram.slug == slug)
            .first()
        )

    def get_active_program_of_user(self, db: Session, user_id: int):
        return (
            db.query(UserActiveProgram)
            .filter(
                and_(
                    UserActiveProgram.user_id == user_id,
                    UserActiveProgram.status == "active"
                )
            )
            .first()
        )

    def create_user_active_program(
        self,
        db: Session,
        user_id: int,
        program_id: int,
        duration_days: int
    ):
        start_date = date.today()
        end_date = start_date + timedelta(days=duration_days)

        user_program = UserActiveProgram(
            user_id=user_id,
            program_id=program_id,
            start_date=start_date,
            end_date=end_date,
            status="active"
        )

        db.add(user_program)
        db.commit()
        db.refresh(user_program)

        return user_program
    
    def get_program_by_id(self, db: Session, program_id: int):
        return (
            db.query(WorkoutProgram)
            .filter(WorkoutProgram.id == program_id)
            .first()
        )
    
    # Create
    # tạo workout plan
    def create_workout_plan_repo(self, db, user_id, plan_date, week_start):

        stmt = insert(WorkoutPlan).values(
            user_id=user_id,
            plan_date=plan_date,
            week_start=week_start
        )

        result = db.execute(stmt)

        return result.inserted_primary_key[0]

    # tạo workout_plan_items
    def create_workout_plan_items_repo(self, db, items):

        stmt = insert(WorkoutPlanItem)

        db.execute(stmt, items)
    
    # ==============================
    # ======= INSERT / POST ========
    # ==============================
    def insert_exercises_by_id_repo(self, db: Session, user_id: int, selected_exercise: list, plan_date, week_start):
        exist_workout_plans = db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id==user_id,
            WorkoutPlan.plan_date==plan_date
        ).first()

        workout_plans = None
        if exist_workout_plans:
            workout_plans = exist_workout_plans
        else:
            workout_plans = WorkoutPlan(
                user_id=user_id,
                plan_date=plan_date,
                week_start=week_start
            )
            db.add(workout_plans)
            db.flush()
        
        exist_workout_plan_items = db.query(WorkoutPlanItem).filter(
            WorkoutPlanItem.workout_plan_id==workout_plans.id
        ).first()

        workout_plan_items = None
        if exist_workout_plan_items:
            workout_plan_items = exist_workout_plan_items
        else:
            workout_plan_items = WorkoutPlanItem(
                workout_plan_id=workout_plans.id,
                exercise_id=selected_exercise.exercise_id,
                sets=selected_exercise.sets,
                reps=selected_exercise.reps,
                duration_minutes=selected_exercise.duration_minutes,
                order_index=selected_exercise.order_index
            )
            db.add(workout_plan_items)
            db.flush()
