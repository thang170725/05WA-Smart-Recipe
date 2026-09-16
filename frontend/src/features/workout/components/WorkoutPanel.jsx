import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, CheckCircle2, PlayCircle, X, Timer, ChevronRight, Trash2 } from "lucide-react";
import LibraryProgram from "./LibraryProgram";
import {
  UpdateActiveDurationSecondsApi,
  UpdateWorkoutSetCompletedApi, GetToTalCaloriesInWeekApi,
  DeleteWorkoutApi
} from "../api/WorkoutProgramsApi";

// ─────────────────────────────────────────────
// Helper: format số giây → "MM:SS"
// ─────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
// Popup đồng hồ bấm giờ cho từng set
// ─────────────────────────────────────────────
function TimerPopup({ exercise, setIndex, onDone, onClose }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setElapsedSeconds(0);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [setIndex]);

  const currentSet = exercise.sets[setIndex];

  const handleDone = () => {
    clearInterval(intervalRef.current);
    onDone(elapsedSeconds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-zinc-950 border border-zinc-800 rounded-4xl p-8 w-full max-w-sm shadow-2xl shadow-emerald-900/10 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer bg-zinc-900 p-2 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6 mt-2">
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight leading-tight mb-2">
            {exercise.exercise_name}
          </h2>
          <div className="inline-flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <span className="text-emerald-500 font-bold text-sm">Set {currentSet.set_number} / {exercise.sets.length}</span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-zinc-400 text-sm">Mục tiêu: {currentSet.target_reps} reps</span>
          </div>
        </div>

        {/* Đồng hồ */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8 bg-zinc-900/50 py-8 rounded-3xl border border-zinc-800/50">
          <Timer size={24} className="text-emerald-500/80 mb-2" />
          <span className="text-7xl font-black text-emerald-400 tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <button
          onClick={handleDone}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-lg py-4 rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          ✓ Hoàn thành Set {currentSet.set_number}
        </button>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────
export default function WorkoutPanel({
  devMode,
  exercisesList, setExercisesList,
  showLibrary, setShowLibrary,
  dateDetail
}) {
  const [activeSession, setActiveSession] = useState(null);
  const [waitingNextSet, setWaitingNextSet] = useState(null);

  const activeSessionRef = useRef(null);
  const exercisesListRef = useRef(exercisesList);

  useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);
  useEffect(() => { exercisesListRef.current = exercisesList; }, [exercisesList]);

  const handleStart = (exerciseIndex) => {
    const exercise = exercisesList[exerciseIndex];
    const firstIncompleteSetIndex = exercise.sets.findIndex(
      (s) => s.completed_reps == null
    );
    if (firstIncompleteSetIndex === -1) return;

    setActiveSession({
      exerciseIndex,
      setIndex: firstIncompleteSetIndex,
      startedAt: new Date().toISOString(),
      setDurations: [],
    });
  };

  const handleDoneSet = async (durationSeconds) => {
    const session = activeSessionRef.current;
    if (!session) return;

    const { exerciseIndex, setIndex, startedAt, setDurations } = session;
    const exercise = exercisesListRef.current[exerciseIndex];
    const currentSet = exercise.sets[setIndex];

    const nextSetIndex = exercise.sets.findIndex(
      (s, i) => i > setIndex && s.completed_reps == null
    );

    const updatedDurations = [...setDurations, durationSeconds];

    setActiveSession(null);

    setExercisesList((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      ex.sets = ex.sets.map((s, i) =>
        i === setIndex ? { ...s, completed_reps: s.target_reps } : s
      );
      copy[exerciseIndex] = ex;
      return copy;
    });

    UpdateWorkoutSetCompletedApi({
      workout_set_id: currentSet.workout_set_id,
      completed_reps: currentSet.target_reps,
    });

    if (nextSetIndex !== -1) {
      setWaitingNextSet({
        exerciseIndex,
        nextSetIndex,
        startedAt,
        setDurations: updatedDurations,
      });
    } else {
      const endedAt = new Date().toISOString();
      const totalActiveDuration = updatedDurations.reduce((a, b) => a + b, 0);

      setExercisesList((prev) => {
        const copy = [...prev];
        copy[exerciseIndex] = {
          ...copy[exerciseIndex],
          started_at: startedAt,
          ended_at: endedAt,
          active_duration_seconds: totalActiveDuration,
          set_durations: updatedDurations,
        };
        return copy;
      });

      await UpdateActiveDurationSecondsApi({
        workout_plan_item_id: exercise.workout_plan_item_id,
        started_at: startedAt,
        ended_at: endedAt,
        active_duration_seconds: totalActiveDuration,
      });
    }
  };

  const handleContinueNextSet = () => {
    if (!waitingNextSet) return;
    setActiveSession({
      exerciseIndex: waitingNextSet.exerciseIndex,
      setIndex: waitingNextSet.nextSetIndex,
      startedAt: waitingNextSet.startedAt,
      setDurations: waitingNextSet.setDurations,
    });
    setWaitingNextSet(null);
  };

  const handleCloseTimer = () => {
    setActiveSession(null);
  };

  //
  // ======== chức năng xóa một bài tập ra khỏi danh sách của user ========
  //
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const confirmDelete = async () => {
    if (exerciseToDelete !== null) {
      setExercisesList((prev) => prev.filter((exercise, idx) => exercise.workout_plan_id !== exerciseToDelete));
      // Lưu ý: Thêm API gọi xóa ở database tại đây nếu cần thiết
      const response = await DeleteWorkoutApi(devMode, exerciseToDelete)
      setExerciseToDelete(null);
    }
  };

  //
  // ====== chức năng hiển thị tổng lượng calories đốt cháy khi tập luyện các bài tập đó
  //
  const [totalCalories, setTotalCalories] = useState(0);
  useEffect(() => {
    const fetchTotalCalories = async () => {
      // Lưu ý: Đảm bảo truyền đúng weekStart dạng chuỗi (VD: "2026-09-15")
      const weekStart = dateDetail.dateStartInWeek ; 
      
      const res = await GetToTalCaloriesInWeekApi(devMode, weekStart);
      if (res && res.total_calories !== undefined) {
        setTotalCalories(res.total_calories);
      }
    };
  
    fetchTotalCalories();
  }, [devMode, dateDetail]);

  return (
    <>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl"
        >
          {/* ── HEADER ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-800/80 pb-6">
            <h2 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-zinc-100">
              <span className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
                <PlayCircle size={24} />
              </span>
              Buổi tập hôm nay
            </h2>

            <div className="flex gap-3">
              {/* Bổ sung thẻ hiển thị Calories tại đây */}
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5">
                🔥 {totalCalories.toFixed(1)} kcal / tuần
              </div>

              <button
                className="bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer text-sm shadow-sm"
                onClick={() => setShowLibrary(true)}
              >
                + Thêm bài tập
              </button>
            </div>
            
          </div>

          {/* ── DANH SÁCH BÀI TẬP ── */}
          {exercisesList.length > 0 ? (
            <div className="space-y-5">
              {exercisesList.map((exercise, exerciseIndex) => {
                if (!exercise) return null

                const sets = exercise?.sets || []
                const completedSets = sets.filter(
                  (s) => s.completed_reps != null
                ).length;
                const totalSets = exercise.sets.length;
                const nextPendingSet = exercise.sets.find(
                  (s) => s.completed_reps == null
                );
                const progress = Math.round((completedSets / totalSets) * 100);
                const isCompleted = completedSets === totalSets;

                const isActive = activeSession?.exerciseIndex === exerciseIndex;
                const isWaiting = waitingNextSet?.exerciseIndex === exerciseIndex;

                return (
                  <motion.div
                    key={exercise.workout_plan_item_id}
                    whileHover={{ scale: 1.005 }}
                    className={`
                      relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300
                      ${isCompleted
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : isActive || isWaiting
                        ? "bg-zinc-800/80 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                        : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
                      }
                    `}
                  >
                    {/* Background Glow nếu đang active */}
                    {(isActive || isWaiting) && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                    )}

                    {/* Tên + độ khó */}
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Dumbbell size={18} className={isCompleted ? "text-emerald-500" : "text-zinc-500"} />
                          <h3 className="text-xl font-bold text-zinc-100">
                            {exercise.exercise_name}
                          </h3>
                        </div>
                        <div>
                          <span
                            className={`
                              px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border
                              ${exercise.difficulty === "easy"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : exercise.difficulty === "medium"
                                ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                              }
                            `}
                          >
                            {exercise.difficulty}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isCompleted && (
                          <CheckCircle2 size={32} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        )}
                        <button
                          onClick={() => setExerciseToDelete(exercise.workout_plan_id)}
                          className="text-zinc-500 hover:text-red-500 transition-colors p-2.5 bg-zinc-900/50 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 cursor-pointer"
                          title="Xóa bài tập"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                    </div>

                    {/* Ô hiển thị từng set */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4 relative z-10">
                      {exercise.sets.map((set) => {
                        const isSetDone = set.completed_reps != null;
                        return (
                          <div
                            key={set.workout_set_id}
                            className={`
                              rounded-xl p-3 text-center flex flex-col justify-center border transition-colors
                              ${isSetDone
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                              }
                            `}
                          >
                            <p className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                              Set {set.set_number}
                            </p>
                            <p className={`font-bold text-sm sm:text-base ${isSetDone ? "text-emerald-400" : "text-zinc-200"}`}>
                              {isSetDone
                                ? `✓ ${set.completed_reps}`
                                : `${set.target_reps || set.reps || 0} reps`}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Thanh tiến độ */}
                    <div className="mt-6 relative z-10">
                      <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        <span>Hoàn thành {completedSets}/{totalSets}</span>
                        <span className={progress === 100 ? "text-emerald-500" : "text-zinc-400"}>{progress}%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] relative"
                        >
                          <div className="absolute inset-0 bg-white/20 w-full" style={{ animation: "shimmer 2s infinite" }}/>
                        </motion.div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-3 gap-2">
                        <div>
                          {nextPendingSet && !isCompleted && (
                            <p className="text-sm text-zinc-400">
                              Tiếp theo: <span className="font-bold text-zinc-200">Set {nextPendingSet.set_number}</span> ({nextPendingSet.target_reps} reps)
                            </p>
                          )}
                          {isCompleted && exercise.active_duration_seconds != null && (
                            <p className="text-sm text-emerald-500 font-medium flex items-center gap-1.5">
                              <Timer size={14} /> Tổng thời gian: {formatTime(exercise.active_duration_seconds)}
                            </p>
                          )}
                        </div>

                        {/* ── Nút bấm – 4 trạng thái ── */}
                        <div className="flex justify-end mt-2 sm:mt-0">
                          {isCompleted ? (
                            <button
                              disabled
                              className="bg-zinc-800 text-zinc-500 px-5 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed border border-zinc-700/50"
                            >
                              Đã xong
                            </button>
                          ) : isActive ? (
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm px-3 py-2 bg-emerald-950/30 rounded-xl border border-emerald-900/50 animate-pulse">
                              <Timer size={16} /> Đang chạy Set {activeSession.setIndex + 1}
                            </div>
                          ) : isWaiting ? (
                            <button
                              onClick={handleContinueNextSet}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-900/30 flex items-center gap-2 text-sm"
                            >
                              <PlayCircle size={16} /> Tiếp tục Set {waitingNextSet.nextSetIndex + 1}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStart(exerciseIndex)}
                              className="bg-zinc-100 hover:bg-white text-zinc-900 font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-sm"
                            >
                              Bắt đầu <ChevronRight size={16} className="-mr-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 border-dashed">
              <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center rounded-full mb-4">
                <Dumbbell size={32} className="text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-300 mb-1">Chưa có bài tập nào</h3>
              <p className="text-zinc-500 text-sm text-center mb-6">Hãy thêm bài tập từ thư viện để bắt đầu lịch trình hôm nay.</p>
              <button 
                onClick={() => setShowLibrary(true)}
                className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 cursor-pointer"
              >
                Khám phá thư viện bài tập
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── POPUP ĐỒNG HỒ ── */}
      <AnimatePresence>
        {activeSession && (
          <TimerPopup
            key={`${activeSession.exerciseIndex}-${activeSession.setIndex}`}
            exercise={exercisesList[activeSession.exerciseIndex]}
            setIndex={activeSession.setIndex}
            onDone={handleDoneSet}
            onClose={handleCloseTimer}
          />
        )}
      </AnimatePresence>

      {/* ── POPUP XÁC NHẬN XÓA ── */}
      <AnimatePresence>
        {exerciseToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Xác nhận xóa</h3>
              <p className="text-zinc-400 mb-6 text-sm">
                Bạn có chắc chắn muốn xóa bài tập <strong className="text-zinc-200">{exercisesList[exerciseToDelete]?.exercise_name}</strong> khỏi lịch hôm nay không?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setExerciseToDelete(null)}
                  className="px-4 py-2.5 rounded-xl font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer shadow-lg shadow-red-900/20"
                >
                  Xóa bài tập
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LIBRARY MODAL ── */}
      <LibraryProgram
        devMode={devMode}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        setExercisesList={setExercisesList}
        dateDetail={dateDetail}
      />
    </>
  );
}