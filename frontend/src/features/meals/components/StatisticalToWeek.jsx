import React, { useState, useMemo } from "react";

export default function StatisticalToWeek() {

  // =============================
  // MOCK USER DATA
  // =============================

  const user = {
    gender: "male",
    weight: 70,
    height: 175,
    activityLevel: "moderate",
    targetGoal: "gain_muscle"
  };

  // =============================
  // MOCK MEALS LIBRARY
  // =============================

  const meals = [
    {
      id: 1,
      name: "Oatmeal Banana",
      calories: 350,
      image: "https://picsum.photos/400/300?1",
      type: "breakfast"
    },
    {
      id: 2,
      name: "Grilled Chicken Breast",
      calories: 500,
      image: "https://picsum.photos/400/300?2",
      type: "lunch"
    },
    {
      id: 3,
      name: "Salmon Salad",
      calories: 450,
      image: "https://picsum.photos/400/300?3",
      type: "dinner"
    },
    {
      id: 4,
      name: "Boiled Eggs",
      calories: 200,
      image: "https://picsum.photos/400/300?4",
      type: "snack"
    },
    {
      id: 5,
      name: "Beef Stir Fry",
      calories: 550,
      image: "https://picsum.photos/400/300?5",
      type: "lunch"
    },
    {
      id: 6,
      name: "Avocado Toast",
      calories: 300,
      image: "https://picsum.photos/400/300?6",
      type: "breakfast"
    },
    {
      id: 7,
      name: "Brown Rice Bowl",
      calories: 400,
      image: "https://picsum.photos/400/300?7",
      type: "dinner"
    }
  ];

  // =============================
  // AI LOGIC
  // =============================

  const calculateBMR = () => {
    if (user.gender === "male") {
      return 10 * user.weight + 6.25 * user.height - 5 * 25 + 5;
    }
    return 10 * user.weight + 6.25 * user.height - 5 * 25 - 161;
  };

  const calculateTDEE = (bmr) => {
    const map = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return bmr * map[user.activityLevel];
  };

  const weekPlan = useMemo(() => {

    const bmr = calculateBMR();
    const tdee = calculateTDEE(bmr);

    let targetCalories = tdee;

    if (user.targetGoal === "lose_weight") {
      targetCalories -= 500;
    } else if (user.targetGoal === "gain_muscle") {
      targetCalories += 300;
    }

    const ratio = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snack: 0.10
    };

    const getMeal = (type, target) => {
      const filtered = meals.filter(m => m.type === type);
      return filtered.sort(
        (a, b) =>
          Math.abs(a.calories - target) -
          Math.abs(b.calories - target)
      )[0];
    };

    const days = [];

    for (let i = 0; i < 7; i++) {

      const breakfast = getMeal("breakfast", targetCalories * ratio.breakfast);
      const lunch = getMeal("lunch", targetCalories * ratio.lunch);
      const dinner = getMeal("dinner", targetCalories * ratio.dinner);
      const snack = getMeal("snack", targetCalories * ratio.snack);

      days.push({
        day: `Day ${i + 1}`,
        meals: [breakfast, lunch, dinner, snack]
      });
    }

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      days
    };

  }, []);

  // =============================
  // UI
  // =============================

  return (
    <div
      className="min-h-screen bg-cover bg-center text-gray-300"
    >
        <h1 className="text-4xl font-bold mb-8 text-center">
          AI StatisticalToWeek
        </h1>

        {/* STAT CARD */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <StatCard label="BMR" value={weekPlan.bmr} />
          <StatCard label="TDEE" value={weekPlan.tdee} />
          <StatCard label="Target Calories" value={weekPlan.targetCalories} />

        </div>

        {/* WEEK PLAN */}
        <div className="grid grid-cols-7 gap-4">

          {weekPlan.days.map((day, index) => (
            <div
              key={index}
              className="bg-gray-900/80 rounded-2xl p-4 shadow-xl hover:scale-105 transition"
            >
              <h2 className="text-center font-semibold mb-4">
                {day.day}
              </h2>

              {day.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="mb-4 bg-black/40 rounded-xl overflow-hidden shadow-md"
                >
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2">
                    <p className="text-sm font-semibold">
                      {meal.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {meal.calories} kcal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>

      </div>
  );
}

// =============================
// COMPONENT STAT CARD
// =============================

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-900/80 p-6 rounded-2xl shadow-xl text-center">
      <p className="text-gray-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}