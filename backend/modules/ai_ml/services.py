import joblib
from backend.modules.ai_ml.schemas import ( 
    InputPostHealthFormSchema
)
from backend.modules.ai_ml.reponsities import AIMLRepo
from backend.modules.meals.services import MealService
from backend.modules.workout.services import WorkoutService

import pandas as pd
from sqlalchemy.orm import Session

class AIMLService:
    def __init__(self):
        self.repo = AIMLRepo()
        self.meal = MealService()
        self.workout = WorkoutService()

        self.xgb_model = joblib.load("./backend/data/weights/xgb_model.joblib")
        self.model = self.xgb_model['model']
        self.features = self.xgb_model['features']
        self.activity_mapping = self.xgb_model["activity_mapping"]
        self.gender_mapping = self.xgb_model["gender_mapping"]


    # tính bmi dựa vào cân nặng và chiều cao
    def _calc_bmi(self, weight, height_cm):
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
    def _calc_body_fat(self, bmi, gender, age):
        sex = 1 if gender == "male" else 0

        return  (1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4)
    
    # tính bmr dựa vào weight, height, age, gender
    def _calc_bmr(self, weight, height_cm, age, gender):
        if gender == "male":
            return ((10 * weight) + (6.25 * height_cm) - (5 * age) + 5) 
        else:
            return ((10 * weight) + (6.25 * height_cm) - (5 * age) - 161)
    
    # calc tdee
    def _calc_tdee(self, bmr, activity_level):
        activity_levels = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }

        activity_factor = activity_levels[activity_level]
        
        return bmr * activity_factor
    
    def _encode(self, activity_level, gender):
        return (
            self.activity_mapping.get(activity_level, -1),
            self.gender_mapping.get(gender, -1)
        )
    
    def analyst_health_form_service(self, db: Session, user_id: int, payload: InputPostHealthFormSchema):
        bmi, label_bmi = self._calc_bmi(payload.weight, payload.height)
        body_fat = self._calc_body_fat(bmi, payload.gender, payload.age)
        bmr = self._calc_bmr(payload.weight, payload.height, payload.age, payload.gender)
        tdee = self._calc_tdee(bmr, payload.activity_level)

        # AI ML
        activity_level_encoded, gender_encoded = self._encode(
            payload.activity_level,
            payload.gender
        )

        # lấy tổng lượng calo ăn và tập trong 1 tuần
        total_calories_meal = self.meal.get_total_calories_week_service(
            db, 
            user_id,
            week_start=payload.week_start
        )
        total_calories_workout = self.workout.get_total_exercise_calories_service(
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
        print(type(total_calories_meal), total_calories_meal)
        print(type(total_calories_workout), total_calories_workout)

        # 👇 đảm bảo đúng thứ tự feature
        df = pd.DataFrame([input_dict])
        df = df[self.features]
        print(df)
        print(df.dtypes)

        # ===== predict =====
        prediction = float(self.model.predict(df)[0])
        print("dự đoán: ", prediction)

        return {
            "bmi": bmi,
            "label_bmi": label_bmi,
            "body_fat": body_fat,
            "bmr": bmr,
            "tdee": tdee,
            "total_meal_calories": total_calories_meal,
            "total_exercise_burned": total_calories_workout,
            "predicted_weight_next_week": round(prediction, 2),
        }


if __name__ == "__main__":
    ai = AIMLService()
