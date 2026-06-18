import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  Dumbbell,
  Flame,
  Calendar,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

import LibraryProgram from "./LibraryProgram";

export default function WorkoutPanel({
  devMode,
  weekPrograms,
  setWeekPrograms,
  selectedDay,
  showLibrary,
  setShowLibrary,
}) {

  // lấy ra danh sách bài tập 1 ngày đang hiện trên website
  const todayExercises = weekPrograms?.week_menu?.[selectedDay] || [];

  /* -------------------------------- */
  /* COMPLETED STATE                  */
  /* -------------------------------- */

  const [completed, setCompleted] = useState({});

  const toggleComplete = (orderIndex) => {
    const key = `${selectedDay}-${orderIndex}`;

    setCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /* -------------------------------- */
  /* PROGRESS CALCULATION             */
  /* -------------------------------- */

  const completedCount = todayExercises.filter(
    (ex) => completed[`${selectedDay}-${ex.order_index}`]
  ).length;

  const progress =
    todayExercises.length === 0
      ? 0
      : (completedCount / todayExercises.length) * 100;

  /* -------------------------------- */
  /* WORKOUT SUMMARY                  */
  /* -------------------------------- */

  const totalCalories = todayExercises.reduce(
    (sum, ex) =>
      sum + ex.calories_per_minute * ex.duration_minutes,
    0
  );

  const totalDuration = todayExercises.reduce(
    (sum, ex) => sum + ex.duration_minutes,
    0
  );

  /* -------------------------------- */
  /* DIFFICULTY COLOR                 */
  /* -------------------------------- */

  const difficultyStyle = (difficulty) => {
    if (difficulty === "hard")
      return "bg-red-500/20 text-red-300";

    if (difficulty === "medium")
      return "bg-yellow-500/20 text-yellow-300";

    return "bg-green-500/20 text-green-300";
  };

  /* -------------------------------- */
  /* RENDER                           */
  /* -------------------------------- */

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
              bg-gradient-to-r
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

          {/* WORKOUT SUMMARY */}

          {todayExercises.length > 0 && (

            <div className="flex gap-6 text-sm text-gray-400 mb-6">

              <span>💪 {todayExercises.length} bài</span>

              <span>🔥 {totalCalories} kcal</span>

              <span>⏱ {totalDuration} phút</span>

            </div>

          )}

          {/* PROGRESS BAR */}

          {todayExercises.length > 0 && (

            <div className="mb-8">

              <div className="flex justify-between text-sm text-gray-300 mb-2">

                <span>
                  {completedCount} / {todayExercises.length} bài tập hoàn thành
                </span>

                <span>{Math.round(progress)}%</span>

              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">

                <div
                  className="
                  h-full
                  bg-gradient-to-r
                  from-emerald-400
                  via-cyan-400
                  to-sky-400
                  transition-all
                  duration-700
                  shadow-[0_0_12px_rgba(34,211,238,0.5)]
                  "
                  style={{ width: `${progress}%` }}
                />

              </div>

            </div>

          )}

          {/* EMPTY STATE */}

          {todayExercises.length === 0 ? (

            <div className="text-center py-20 text-gray-400">

              <Calendar
                size={50}
                className="mx-auto mb-4 opacity-30"
              />

              <p className="text-lg">
                Hôm nay là ngày nghỉ 🧘
              </p>

              <p className="text-sm mt-1">
                Cơ bắp cần thời gian phục hồi để phát triển.
              </p>

            </div>

          ) : (

            /* EXERCISE LIST */

            <div className="space-y-5">

              {todayExercises
                .sort((a, b) => a.order_index - b.order_index)
                .map((ex) => {

                  const key = `${selectedDay}-${ex.order_index}`;

                  const isDone = completed[key];

                  const calories =
                    ex.calories_per_minute *
                    ex.duration_minutes;

                  return (

                    <motion.div
                      key={ex.order_index}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}

                      className={`
                      p-6
                      rounded-2xl
                      flex
                      flex-col
                      md:flex-row
                      md:items-center
                      justify-between
                      gap-6
                      transition-all
                      duration-300
                      hover:scale-[1.02]
                      hover:bg-white/10
                      ${
                        isDone
                          ? "bg-green-600/10 border border-green-500/30 opacity-70"
                          : "bg-white/5 border border-white/10"
                      }
                      `}
                    >

                      {/* LEFT SIDE */}

                      <div className="flex items-start gap-4">

                        <div
                          className="
                          w-14 h-14
                          bg-gradient-to-br
                          from-sky-500/20
                          to-cyan-400/20
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          "
                        >
                          <Dumbbell size={20} />
                        </div>

                        <div>

                          <h4 className="text-lg font-semibold">
                            {ex.name}
                          </h4>

                          <div className="flex gap-4 text-sm text-gray-400 mt-2">

                            {/* DIFFICULTY */}

                            <span
                              className={`
                              px-2 py-0.5
                              rounded-md
                              text-xs
                              font-medium
                              ${difficultyStyle(ex.difficulty)}
                              `}
                            >
                              {ex.difficulty}
                            </span>

                            {/* CALORIES */}

                            <span className="flex items-center gap-1">

                              <Flame size={14} />

                              ~{calories} kcal

                            </span>

                            {/* SETS */}

                            <span className="text-gray-500">

                              {ex.sets} sets × {ex.reps} reps

                            </span>

                          </div>

                        </div>

                      </div>

                      {/* COMPLETE BUTTON */}

                      <button
                        onClick={() =>
                          toggleComplete(ex.order_index)
                        }
                        className={`
                        w-12 h-12
                        rounded-full
                        flex
                        items-center
                        justify-center
                        transition-all
                        ${
                          isDone
                            ? "bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                            : "bg-white/10 hover:bg-white hover:text-black"
                        }
                        `}
                      >

                        {isDone ? (
                          <CheckCircle2 size={22} />
                        ) : (
                          <PlayCircle size={22} />
                        )}

                      </button>

                    </motion.div>

                  );

                })}

            </div>

          )}

        </motion.div>

      </div>

      {/* LIBRARY MODAL */}

      <LibraryProgram
        devMode={devMode}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        setWeekPrograms={setWeekPrograms}
        selectedDay={selectedDay}
      />

    </>
  );
}