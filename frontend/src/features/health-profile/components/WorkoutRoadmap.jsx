// WorkoutRoadmap.jsx
import { useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";

export default function WorkoutRoadmap() {
  const workoutPlan = {
    Mon: [{ id: 1, name: "Push Up", sets: 3, reps: 12 }],
    Tue: [],
    Wed: [{ id: 2, name: "Squat", sets: 4, reps: 15 }],
  };

  const [selectedDay, setSelectedDay] = useState("Mon");
  const [completed, setCompleted] = useState({});

  const todayExercises = workoutPlan[selectedDay] || [];

  const toggleComplete = (id) => {
    setCompleted({
      ...completed,
      [`${selectedDay}-${id}`]: !completed[`${selectedDay}-${id}`],
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Lộ trình luyện tập</h1>

      {/* Day selector */}
      <div className="flex gap-2">
        {Object.keys(workoutPlan).map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg ${
              selectedDay === day
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="bg-gray-900 p-6 rounded-xl space-y-4">
        {todayExercises.length === 0 ? (
          <p className="text-gray-500">Hôm nay nghỉ ngơi</p>
        ) : (
          todayExercises.map((ex) => (
            <div
              key={ex.id}
              className="flex justify-between items-center p-4 bg-gray-800 rounded-lg"
            >
              <div>
                <h4 className="font-semibold">{ex.name}</h4>
                <p className="text-sm text-gray-400">
                  {ex.sets} sets × {ex.reps}
                </p>
              </div>

              <button
                onClick={() => toggleComplete(ex.id)}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center"
              >
                {completed[`${selectedDay}-${ex.id}`] ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <PlayCircle size={20} />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
