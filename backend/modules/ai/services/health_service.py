from backend.modules.ai_assistant.tools import calculate_health_metrics
from backend.modules.ai_ml.model import XGBoostModel
import joblib

class HealthService:
    def __init__(self):
        self.xgb = XGBoostModel()

    def get_health_metrics(self, height_cm, weight, age, gender, activity_level):
        bmi, bmr, body_fat, tdee, label = calculate_health_metrics(height_cm, weight, age, gender, activity_level)

        xgb = joblib.load("./backend/data/weights/xgb_model.joblib")
        gender, activity_level = self.xgb.encode(activity_level, gender)
        self.xgb.model = xgb.model
        mse, r2 = xgb.mse, xgb.r2

        total_meal_calories = None
        total_exercise_burned = None

        label_weight_next_week = self.xgb.predict([gender, age, height_cm, weight, bmr, activity_level, tdee, total_meal_calories, total_exersise_burned])
        
        return {
            "bmi": bmi,
            "bmr": body_fat,
            "tdee": tdee,
            "label": label,
            "label_weight_next_week": label_weight_next_week,
            "mse": mse,
            "r2": r2
        }