import random as r
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

class DatasetTool:
    def __init__(self,):
        self.df = pd.DataFrame(
            columns=[
                'gender', 
                'age', 
                'height', 
                'weight_start',	
                'activity_level', 
                'total_meal_calories', 
                'total_exercise_burned', 
                'label_weight_next_month'
            ]
        )
    
    def create_row(self):
        activity_levels = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }
        activity_level = r.choice(list(activity_levels.keys()))
        activity_factor = activity_levels[activity_level]
        
        gender = r.choice(['male', 'female'])    
        age = r.randint(15, 70)
        # ----- Height & Weight realistic -----
        if gender == "male":
            height = r.uniform(155, 190)
            weight = r.uniform(45, 110)
        else:
            height = r.uniform(150, 175)
            weight = r.uniform(30, 85)
        # ----- BMR -----
        if gender == "male":
            BMR = (10 * weight) + (6.25 * height) - (5 * age) + 5
        else:
            BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161
        # ----- TDEE -----
        TDEE = BMR * activity_factor
        # ----- month calories realistic -----
        days = r.randint(28, 31)

        # Calories ăn vào (giữ như bạn là OK)
        total_meal_calories = r.uniform(TDEE * days * 0.9, TDEE * days * 1.1)

        # --- Exercise burned realistic ---
        base_burn_map = {
            'sedentary': (200, 800),
            'light': (500, 1500),
            'moderate': (1000, 3000),
            'active': (2000, 6000),
            'very_active': (4000, 10000)
        }

        low, high = base_burn_map[activity_level]

        # random theo gaussian để không bị đều quá
        total_exercise_burned = r.uniform(low, high) + r.gauss(0, 200)

        # đảm bảo không âm
        total_exercise_burned = max(100, total_exercise_burned)

        # ----- month balance -----
        monthly_balance = total_meal_calories - (BMR*days) - total_exercise_burned
        base_change = monthly_balance / 7700

        weight_change = base_change + r.gauss(0, 0.2)

        # 5% outlinear
        if r.random() < 0.05:
            weight_change += r.gauss(0, 1.0)

        label_weight_next_month = weight + weight_change

        return [
            gender, 
            age, 
            height, 
            weight,
            activity_level,
            total_meal_calories, 
            total_exercise_burned,
            label_weight_next_month
        ]
    
    def create_rows(self, rows=3000):
        for _ in range(rows):
            self.df.loc[len(self.df)] = self.create_row()

    def save_csv(self):
        self.df.to_csv("backend/database-dataset/ai_ml.csv", index=False)
        print("completed ...")

class Preprocessor:
    def __init__(self, path_csv="./backend/database/ai_ml.csv"):
        self.df = pd.read_csv(path_csv)
        self._feature_engineering()

    # =========================================================
    # Feature Engineering
    # =========================================================
    def _feature_engineering(self):
        # Weight change
        self.df["weight_change"] = (
            self.df["label_weight_next_week"]
            - self.df["weight_start"]
        )

        # Weekly calorie balance
        self.df["weekly_balance"] = (
            self.df["total_meal_calories"]
            - self.df["tdee"] * 7
            - self.df["total_exercise_burned"]
        )

    # =========================================================
    # 1️⃣ HISTOGRAM & BAR CHART WINDOW
    # =========================================================
    def chart_histograms(self):
        fig, ax = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle("Distribution Charts", fontsize=16)

        # Gender (Bar chart)
        self.df["gender"].value_counts().plot(
            kind="bar", ax=ax[0, 0]
        )
        ax[0, 0].set_title("Gender Distribution")

        # Activity level (Bar chart)
        self.df["activity_level"].value_counts().plot(
            kind="bar", ax=ax[0, 1]
        )
        ax[0, 1].set_title("Activity Level Distribution")

        # Next week weight histogram
        ax[1, 0].hist(
            self.df["label_weight_next_week"], bins=30
        )
        ax[1, 0].set_title("Next Week Weight Distribution")

        # Weight change histogram
        ax[1, 1].hist(
            self.df["weight_change"], bins=30
        )
        ax[1, 1].set_title("Weight Change Distribution")

        plt.tight_layout()
        plt.show()

    # =========================================================
    # 2️⃣ SCATTER WINDOW
    # =========================================================
    def chart_scatter(self):
        fig, ax = plt.subplots(1, 2, figsize=(14, 5))
        fig.suptitle("Relationship Analysis", fontsize=16)

        # Weekly balance vs weight change
        ax[0].scatter(
            self.df["weekly_balance"],
            self.df["weight_change"],
        )
        ax[0].set_xlabel("Weekly Calorie Balance")
        ax[0].set_ylabel("Weight Change")
        ax[0].set_title("Balance vs Weight Change")

        # TDEE vs Meal Calories
        ax[1].scatter(
            self.df["tdee"] * 7,
            self.df["total_meal_calories"],
        )
        ax[1].set_xlabel("Weekly TDEE")
        ax[1].set_ylabel("Weekly Meal Calories")
        ax[1].set_title("TDEE vs Meal Calories")

        plt.tight_layout()
        plt.show()

    # =========================================================
    # 3️⃣ CORRELATION HEATMAP WINDOW
    # =========================================================
    def chart_correlation(self):
        numeric_df = self.df.select_dtypes(
            include=["float64", "int64"]
        )

        corr = numeric_df.corr()

        plt.figure(figsize=(12, 10))
        plt.title("Correlation Heatmap", fontsize=16)
        sns.heatmap(
            corr,
            annot=True,
            cmap="coolwarm",
            fmt=".2f"
        )
        plt.tight_layout()
        plt.show()

    # =========================================================
    # 4️⃣ BOXPLOT WINDOW
    # =========================================================
    def chart_boxplot(self):
        fig, ax = plt.subplots(1, 2, figsize=(12, 5))
        fig.suptitle("Outlier Analysis", fontsize=16)

        # Weight change
        ax[0].boxplot(self.df["weight_change"])
        ax[0].set_title("Weight Change Boxplot")

        # Weekly balance
        ax[1].boxplot(self.df["weekly_balance"])
        ax[1].set_title("Weekly Balance Boxplot")

        plt.tight_layout()
        plt.show()

    # =========================================================
    # MAIN FUNCTION - RUN ALL
    # =========================================================
    def run_all(self):
        print("Running Full EDA Pipeline...\n")

        self.chart_histograms()
        self.chart_scatter()
        self.chart_correlation()
        self.chart_boxplot()

        print("\nEDA Completed Successfully.")

if __name__ == "__main__":
    create_data = DatasetTool()
    create_data.create_rows(5000)
    create_data.save_csv()
    # preprocessor = Preprocessor()
    # preprocessor.run_all()
