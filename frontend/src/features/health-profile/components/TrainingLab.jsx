// TrainingLab.jsx
import { useMemo } from "react";
import HealthCenter from "./HealthCenter";
import WorkoutRoadmap from "./WorkoutRoadmap";

export default function TrainingLab() {
  
  const workoutPlan = {
    Mon: [{ id: 1, name: "Push Up", sets: 3, reps: 12 }],
    Tue: [],
    Wed: [{ id: 2, name: "Squat", sets: 4, reps: 15 }],
  };

  return (
    <div className="flex">
      {/* Router sẽ render 1 trong 2 component */}
      {/* Ví dụ nếu dùng React Router */}
      
      <HealthCenter user={USER_DB} metrics={metrics} />
      {/* hoặc */}
      {/* <WorkoutRoadmap workoutPlan={workoutPlan} /> */}

    </div>
  );
}
