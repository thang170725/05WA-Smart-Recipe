import joblib
import pandas as pd

from backend.modules.ai_ml.schemas import (
    InputPostHealthFormSchema
)

from backend.modules.ai_ml import repositories
from backend.modules.meals import services as meal_services
from backend.modules.workout import services as workout_services

from sqlalchemy.ext.asyncio import AsyncSession


# Load model
xgb_model = joblib.load("./backend/data/weights/xgb_model.joblib")

model = xgb_model["model"]
features = xgb_model["features"]
activity_mapping = xgb_model["activity_mapping"]
gender_mapping = xgb_model["gender_mapping"]


# tính bmi dựa vào cân nặng và chiều cao
def _calc_bmi(weight, height_cm):

    bmi = round(weight / ((height_cm / 100) ** 2), 2)

    label = ""

    if bmi < 16:
        label = "rất gầy"

    elif bmi < 18.5:
        label = "gầy"

    elif bmi < 25:
        label = "cân đối"

    elif bmi < 30:
        label = "béo"

    else:
        label = "rất béo"

    return bmi, label


# tính body fat dựa vào bmi, gender, age
def _calc_body_fat(bmi, gender, age):

    sex = 1 if gender == "male" else 0

    return (1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4)


# tính bmr dựa vào weight, height, age, gender
def _calc_bmr(weight, height_cm, age, gender):

    if gender == "male":

        return (
            (10 * weight)
            + (6.25 * height_cm)
            - (5 * age)
            + 5
        )

    else:

        return (
            (10 * weight)
            + (6.25 * height_cm)
            - (5 * age)
            - 161
        )


# calc tdee
def _calc_tdee(bmr, activity_level):

    activity_levels = {

        "sedentary": 1.2,

        "light": 1.375,

        "moderate": 1.55,

        "active": 1.725,

        "very_active": 1.9
    }

    activity_factor = activity_levels[activity_level]

    return bmr * activity_factor


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

        bmi, label_bmi = _calc_bmi(
            payload.weight,
            payload.height
        )

        body_fat = _calc_body_fat(
            bmi,
            payload.gender,
            payload.age
        )

        bmr = _calc_bmr(
            payload.weight,
            payload.height,
            payload.age,
            payload.gender
        )

        tdee = _calc_tdee(
            bmr,
            payload.activity_level
        )

        # AI ML
        activity_level_encoded, gender_encoded = _encode(
            payload.activity_level,
            payload.gender
        )

        # lấy tổng lượng calo ăn và tập trong 1 tuần
        total_calories_meal = await meal_services.get_total_calories_week_service(
            db,
            user_id,
            payload.week_start
        )

        total_calories_workout = await workout_services.get_total_exercise_calories_service(
            db,
            user_id,
            payload.weight,
            payload.week_start
        )

        input_dict = {

            "gender": gender_encoded,

            "age": payload.age,

            "height": payload.height,

            "weight_start": payload.weight,

            "activity_level": activity_level_encoded,

            "total_meal_calories": total_calories_meal,

            "total_exercise_burned": total_calories_workout
        }

        print("Input for ML: ", input_dict)

        print(
            type(total_calories_meal),
            total_calories_meal
        )

        print(
            type(total_calories_workout),
            total_calories_workout
        )

        # 👇 đảm bảo đúng thứ tự feature
        df = pd.DataFrame([input_dict])

        df = df[features]

        print(df)

        print(df.dtypes)

        # ===== predict =====
        prediction = float(
            model.predict(df)[0]
        )

        print("dự đoán: ", prediction)

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