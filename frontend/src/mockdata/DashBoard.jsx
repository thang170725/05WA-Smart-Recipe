export function MockDataDashboard () {
  return {

  stats: {
    total_meal_plans: 36,
    completed_workouts: 82,
    total_posts: 14,
    total_comments: 52
  },

  calories_weekly: [
    { week: "W1", calories: 2800 },
    { week: "W2", calories: 3100 },
    { week: "W3", calories: 2600 },
    { week: "W4", calories: 3500 }
  ],

  workout_weekly: [
    { week: "W1", sessions: 3 },
    { week: "W2", sessions: 4 },
    { week: "W3", sessions: 2 },
    { week: "W4", sessions: 5 }
  ],

  muscle_distribution: [
    { name: "Chest", value: 20 },
    { name: "Legs", value: 30 },
    { name: "Back", value: 25 },
    { name: "Arms", value: 15 },
    { name: "Core", value: 10 }
  ]
}
};

export function MockDataHealthHistory () {
  return [
    { month: "Oct", bmi_avarage: 24 },
    { month: "Nov", bmi_avarage: 23.6 },
    { month: "Dec", bmi_avarage: 23.2 },
    { month: "Jan", bmi_avarage: 22.9 },
    { month: "Feb", bmi_avarage: 22.5 },
    { month: "Mar", bmi_avarage: 22.4 }
  ]
}