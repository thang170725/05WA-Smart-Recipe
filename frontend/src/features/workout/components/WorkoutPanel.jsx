import React from "react";
import { motion } from "framer-motion";

import {
  Dumbbell,
  Flame,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

import LibraryProgram from "./LibraryProgram";

export default function WorkoutPanel({
  devMode,
  exercisesList,
  setExercisesList,
  selectedDay,
  showLibrary,
  setShowLibrary,
  planDate,
  weekStart,
}) {

  // hoàn thành 1 set
  const completeSet = (exerciseIndex) => {
    setExercisesList((prev) =>
      prev.map((item, idx) => {
        if (idx !== exerciseIndex) return item;

        return {
          ...item,
          completed_sets: Math.min(
            (item.completed_sets || 0) + 1,
            item.sets
          ),
        };
      })
    );
  };

  return (
    <>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="
          bg-white/10
          backdrop-blur-xl
          border border-white/10
          rounded-3xl
          p-8
          shadow-2xl
          "
        >
          {/* HEADER ACTIONS */}
          <div className="flex justify-between items-center mb-6">
            <button
              className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              font-semibold
              text-black
              bg-linear-to-r
              from-emerald-400
              to-cyan-400
              hover:scale-105
              transition
              "
            >
              <PlayCircle size={18} />
              Bắt đầu buổi tập
            </button>

            <button
              className="
              bg-white/10
              px-4 py-2
              rounded-xl
              hover:bg-white/20
              transition
              "
              onClick={() => setShowLibrary(true)}
            >
              + Thêm bài tập
            </button>
          </div>

          {/* LIST EXERCISES*/}
          {exercisesList.length > 0 ? (
            <div className="space-y-4">
              {exercisesList.map((exercise, index) => {
                const completedSets = exercise.completed_sets || 0;

                const progress = Math.round(
                  (completedSets / exercise.sets) * 100
                );

                const totalCalories =
                  exercise.calories_per_minute *
                  exercise.duration_minutes;

                const burnedCalories = Math.round(
                  totalCalories *
                    (completedSets / exercise.sets)
                );

                const isCompleted =
                  completedSets >= exercise.sets;

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    className={`
                      rounded-2xl
                      border
                      p-5
                      transition-all
                      ${
                        isCompleted
                          ? "bg-emerald-500/15 border-emerald-400/30"
                          : "bg-white/5 border-white/10"
                      }
                    `}
                  >
                    {/* HEADER CARD */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Dumbbell size={18} />
                          <h3 className="text-xl font-bold">
                            {exercise.exercise_name}
                          </h3>
                        </div>

                        <div className="mt-2">
                          <span
                            className={`
                              px-3 py-1
                              rounded-full
                              text-xs
                              font-semibold
                              ${
                                exercise.difficulty === "easy"
                                  ? "bg-green-500/20 text-green-300"
                                  : exercise.difficulty === "medium"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-red-500/20 text-red-300"
                              }
                            `}
                          >
                            {exercise.difficulty}
                          </span>
                        </div>
                      </div>

                      {isCompleted && (
                        <CheckCircle2
                          size={28}
                          className="text-emerald-400"
                        />
                      )}
                    </div>

                    {/* INFO */}
                    <div className="grid grid-cols-4 gap-3 mt-5">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-400">
                          Sets
                        </p>
                        <p className="font-bold">
                          {exercise.sets}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-400">
                          Reps
                        </p>
                        <p className="font-bold">
                          {exercise.reps}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-400">
                          Duration
                        </p>
                        <p className="font-bold">
                          {exercise.duration_minutes} phút
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-400">
                          Calories
                        </p>
                        <p className="font-bold">
                          {burnedCalories}/
                          {totalCalories} kcal
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span>
                          Set {completedSets}/
                          {exercise.sets}
                        </span>

                        <span>{progress}%</span>
                      </div>

                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${progress}%`,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                          className="
                            h-full
                            bg-gradient-to-r
                            from-emerald-400
                            to-cyan-400
                          "
                        />
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() =>
                          completeSet(index)
                        }
                        disabled={isCompleted}
                        className={`
                          px-4 py-2
                          rounded-xl
                          font-semibold
                          transition
                          ${
                            isCompleted
                              ? "bg-emerald-500 text-white cursor-not-allowed"
                              : "bg-cyan-500 hover:bg-cyan-400 text-white"
                          }
                        `}
                      >
                        {isCompleted
                          ? "Đã hoàn thành"
                          : "+1 Set"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              Chưa có bài tập nào
            </div>
          )}
        </motion.div>
      </div>

      {/* LIBRARY MODAL */}
      <LibraryProgram
        devMode={devMode}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        setExercisesList={setExercisesList}
        selectedDay={selectedDay}
        planDate={planDate}
        weekStart={weekStart}
      />
    </>
  );
}