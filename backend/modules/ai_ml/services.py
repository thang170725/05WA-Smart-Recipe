import joblib
import pandas as pd

from backend.modules.ai_ml.schemas import InputPostHealthFormSchema
from backend.modules.ai_ml import repositories
from backend.modules.meals.services import get_total_calories_week_service
from backend.modules.workout.services import get_service as workout_get_service
from backend.config import formula
from sqlalchemy.ext.asyncio import AsyncSession


# Load model
xgb_model = joblib.load("./backend/data/weights/xgb_model.joblib")

model = xgb_model["model"]
features = xgb_model["features"]
activity_mapping = xgb_model["activity_mapping"]
gender_mapping = xgb_model["gender_mapping"]


def _encode(activity_level, gender):
    return (
        activity_mapping.get(activity_level, -1),
        gender_mapping.get(gender, -1)
    )


async def analyst_health_form_service(
    db: AsyncSession,
    user_id: int,
    payload: InputPostHealthFormSchema
):
    try:
        # =========================
        # CALCULATE HEALTH METRICS
        # =========================

        bmi, label_bmi = formula.calc_bmi(
            payload.weight,
            payload.height
        )

        body_fat = formula.calc_body_fat(
            bmi,
            payload.gender,
            payload.age
        )

        bmr = formula.calc_bmr(
            payload.weight,
            payload.height,
            payload.age,
            payload.gender
        )

        tdee = formula.calc_tdee(
            bmr,
            payload.activity_level
        )

        # =========================
        # ENCODE DATA FOR ML
        # =========================

        activity_level_encoded, gender_encoded = _encode(
            payload.activity_level,
            payload.gender
        )

        # =========================
        # GET WEEKLY CALORIES
        # =========================

        total_calories_meal = await get_total_calories_week_service(
            db,
            user_id,
            payload.week_start
        )

        total_calories_workout = await workout_get_service.get_total_exercise_calories_service(
            db,
            user_id,
            payload.week_start
        )

        # =========================
        # NORMALIZE SERVICE RESULTS
        # =========================

        # Meal calories
        if isinstance(total_calories_meal, dict):
            total_calories_meal = total_calories_meal.get(
                "total_calories",
                0
            )

        # Workout calories
        if isinstance(total_calories_workout, dict):
            total_calories_workout = total_calories_workout.get(
                "total_calories",
                0
            )

        total_calories_meal = float(total_calories_meal or 0)
        total_calories_workout = float(total_calories_workout or 0)

        # =========================
        # INPUT FOR ML
        # =========================

        input_dict = {
            "gender": gender_encoded,
            "age": payload.age,
            "height": payload.height,
            "weight_start": payload.weight,
            "activity_level": activity_level_encoded,
            "total_meal_calories": total_calories_meal,
            "total_exercise_burned": total_calories_workout
        }

        print("Input for ML:", input_dict)

        print(
            "meal:",
            type(total_calories_meal),
            total_calories_meal
        )

        print(
            "workout:",
            type(total_calories_workout),
            total_calories_workout
        )

        # =========================
        # CREATE DATAFRAME
        # =========================

        df = pd.DataFrame([input_dict])

        # Đảm bảo đúng thứ tự feature lúc train
        df = df[features]

        print("ML DataFrame:")
        print(df)

        print("DataFrame dtypes:")
        print(df.dtypes)

        # =========================
        # PREDICT
        # =========================

        prediction = float(
            model.predict(df)[0]
        )

        print("Dự đoán:", prediction)

        # =========================
        # RESPONSE
        # =========================

        return {
            "bmi": bmi,
            "label_bmi": label_bmi,
            "body_fat": body_fat,
            "bmr": bmr,
            "tdee": tdee,

            "total_meal_calories": total_calories_meal,

            "total_exercise_burned": total_calories_workout,

            "predicted_weight_next_week": round(
                prediction,
                2
            ),
        }

    except Exception as e:
        print("LỖI ANALYST HEALTH FORM:", e)
        raise