import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# MODEL AI ML AS XGBOOST
class XGBoostModel:
    def __init__(self, path_csv="./backend/database-dataset/ai_ml.csv"):
        self.df = pd.read_csv(path_csv)

        # ===== 1. ENCODE CATEGORICAL ====
        self._encode_df()

        # ===== 2. Tách X, y =====
        self.X = self.df.drop("label_weight_next_month", axis=1)
        self.y = self.df["label_weight_next_month"]

        # ===== 3. SPLIT =======
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X,
            self.y,
            test_size=0.2,
            random_state=42
        )

        # ===== 4. Model =====
        self.model = XGBRegressor(
            n_estimators=300,
            max_depth=4,
            learning_rate=0.05,
            objective="reg:squarederror",
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            tree_method="hist"
        )

    # encode dùng cho training
    def _encode_df(self):
        self.activity_mapping = {
            "sedentary": 0,
            "light": 1,
            "moderate": 2,
            "active": 3,
            "very_active": 4
        }

        self.gender_mapping = {
            "male": 0,
            "female": 1
        }

        self.df["activity_level"] = self.df["activity_level"].map(self.activity_mapping)
        self.df["gender"] = self.df["gender"].map(self.gender_mapping)

        # fallback nếu có giá trị lạ
        self.df["activity_level"] = self.df["activity_level"].fillna(-1)
        self.df["gender"] = self.df["gender"].fillna(-1)
    
    # encode dùng cho inference
    def encode_input(self, activity_level, gender):
        return (
            self.activity_mapping.get(activity_level, -1),
            self.gender_mapping.get(gender, -1)
        )

    def train(self):
        self.model.fit(
            self.X_train,
            self.y_train,
            eval_set=[(self.X_test, self.y_test)],
            verbose=False
        )

    def predict(self, X):
        return self.model.predict(X)

    def evaluate(self):
        y_pred = self.model.predict(self.X_test)

        mse = mean_squared_error(self.y_test, y_pred)
        r2 = r2_score(self.y_test, y_pred)

        return {
            "MSE": mse,
            "R2": r2
        }

    def save_model(self, save_path="backend/data/weights/xgb_model.joblib"):
        eval = self.evaluate()

        joblib.dump({
            "model": self.model,
            "mse": eval["MSE"],
            "r2": eval["R2"],
            "features": list(self.X.columns),
            "activity_mapping": self.activity_mapping,
            "gender_mapping": self.gender_mapping
        }, save_path, compress=3)

if __name__ == "__main__":
    xgb = XGBoostModel()
    xgb.train()
    xgb.save_model()
    print(xgb.evaluate())