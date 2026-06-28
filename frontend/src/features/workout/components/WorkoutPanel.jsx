import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, CheckCircle2, PlayCircle, X, Timer } from "lucide-react";
import LibraryProgram from "./LibraryProgram";
import {
  UpdateActiveDurationSecondsApi,
  UpdateWorkoutSetCompletedApi,
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
// Props:
//   exercise  – object bài tập hiện tại
//   setIndex  – index của set đang chạy trong mảng sets (0-based)
//   onDone    – callback(durationSeconds) khi bấm "Done Set"
//   onClose   – callback khi bấm X (hủy session)
// ─────────────────────────────────────────────
function TimerPopup({ exercise, setIndex, onDone, onClose }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Mỗi khi setIndex thay đổi (chuyển set): reset đồng hồ và chạy lại
  useEffect(() => {
    setElapsedSeconds(0); // reset về 0 khi chuyển set mới
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [setIndex]);

  const currentSet = exercise.sets[setIndex];

  const handleDone = () => {
    clearInterval(intervalRef.current);
    onDone(elapsedSeconds); // trả về số giây đã tập của set này
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="bg-gray-900 border border-white/15 rounded-3xl p-8 w-80 shadow-2xl relative"
      >
        {/* Nút X đóng popup – hủy toàn bộ session */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white text-center mb-1">
          {exercise.exercise_name}
        </h2>

        <p className="text-cyan-400 text-center text-sm mb-6">
          Set {currentSet.set_number} / {exercise.sets.length}
          &nbsp;•&nbsp; Mục tiêu: {currentSet.target_reps} reps
        </p>

        {/* Đồng hồ */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Timer size={28} className="text-cyan-400" />
          <span className="text-6xl font-bold text-cyan-400 tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <button
          onClick={handleDone}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition"
        >
          ✓ Done Set {currentSet.set_number}
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
  exercisesList,
  setExercisesList,
  selectedDay,
  showLibrary,
  setShowLibrary,
  planDate,
  weekStart,
}) {
  // activeSession != null → popup đang mở
  // { exerciseIndex, setIndex, startedAt, setDurations[] }
  const [activeSession, setActiveSession] = useState(null);

  // waitingNextSet != null → đã xong 1 set, đang chờ user bấm "Tiếp tục"
  // { exerciseIndex, nextSetIndex, startedAt, setDurations[] }
  const [waitingNextSet, setWaitingNextSet] = useState(null);

  // ─── useRef để tránh stale closure ───
  // React: khi TimerPopup nhận prop onDone, nó "đóng băng" hàm đó tại thời điểm render.
  // Nếu handleDoneSet đọc activeSession / exercisesList trực tiếp từ closure,
  // nó sẽ đọc giá trị CŨ (tại thời điểm popup được mount), không phải giá trị hiện tại.
  // Giải pháp: lưu giá trị mới nhất vào ref → ref.current luôn là giá trị mới nhất.
  const activeSessionRef = useRef(null);
  const exercisesListRef = useRef(exercisesList);

  // Đồng bộ ref mỗi khi state thay đổi
  useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);
  useEffect(() => { exercisesListRef.current = exercisesList; }, [exercisesList]);

  // ── Bắt đầu bài tập: tìm set đầu tiên chưa xong và mở popup ──
  const handleStart = (exerciseIndex) => {
    const exercise = exercisesList[exerciseIndex];

    const firstIncompleteSetIndex = exercise.sets.findIndex(
      (s) => s.completed_reps == null
    );
    if (firstIncompleteSetIndex === -1) return; // tất cả set đã xong

    setActiveSession({
      exerciseIndex,
      setIndex: firstIncompleteSetIndex,
      startedAt: new Date().toISOString(),
      setDurations: [],
    });
  };

  // ── Khi bấm "Done Set" trong popup ──
  const handleDoneSet = async (durationSeconds) => {
    // Đọc từ REF thay vì closure → luôn lấy được giá trị mới nhất
    const session = activeSessionRef.current;
    if (!session) return; // guard: không làm gì nếu session đã null

    const { exerciseIndex, setIndex, startedAt, setDurations } = session;

    // Đọc exercisesList từ ref để có data mới nhất
    const exercise = exercisesListRef.current[exerciseIndex];
    const currentSet = exercise.sets[setIndex];

    // Tìm set tiếp theo chưa hoàn thành (scan từ setIndex+1 trở đi)
    const nextSetIndex = exercise.sets.findIndex(
      (s, i) => i > setIndex && s.completed_reps == null
    );

    // Cộng thêm duration của set vừa xong
    const updatedDurations = [...setDurations, durationSeconds];

    // Đóng popup NGAY LẬP TỨC trước khi làm bất cứ điều gì khác
    setActiveSession(null);

    // Đánh dấu set này hoàn thành trong state
    setExercisesList((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      ex.sets = ex.sets.map((s, i) =>
        i === setIndex ? { ...s, completed_reps: s.target_reps } : s
      );
      copy[exerciseIndex] = ex;
      return copy;
    });

    // Gọi API cập nhật set đã hoàn thành (không await để không block UI)
    UpdateWorkoutSetCompletedApi({
      workout_set_id: currentSet.workout_set_id,
      completed_reps: currentSet.target_reps,
    });

    if (nextSetIndex !== -1) {
      // Còn set tiếp → chuyển sang trạng thái "chờ nghỉ giữa set"
      setWaitingNextSet({
        exerciseIndex,
        nextSetIndex,
        startedAt,
        setDurations: updatedDurations,
      });
    } else {
      // Hết tất cả set → tính tổng và lưu
      const endedAt = new Date().toISOString();
      const totalActiveDuration = updatedDurations.reduce((a, b) => a + b, 0);

      setExercisesList((prev) => {
        const copy = [...prev];
        copy[exerciseIndex] = {
          ...copy[exerciseIndex],
          started_at: startedAt,
          ended_at: endedAt,
          active_duration_seconds: totalActiveDuration,
          set_durations: updatedDurations, // chi tiết từng set để debug
        };
        return copy;
      });

      // Gọi API lưu tổng kết bài tập
      await UpdateActiveDurationSecondsApi({
        workout_plan_item_id: exercise.workout_plan_item_id,
        started_at: startedAt,
        ended_at: endedAt,
        active_duration_seconds: totalActiveDuration,
      });
    }
  };

  // ── User bấm "Tiếp tục Set N" → mở lại popup cho set kế ──
  const handleContinueNextSet = () => {
    if (!waitingNextSet) return;

    setActiveSession({
      exerciseIndex: waitingNextSet.exerciseIndex,
      setIndex: waitingNextSet.nextSetIndex,
      startedAt: waitingNextSet.startedAt,
      setDurations: waitingNextSet.setDurations,
    });

    setWaitingNextSet(null); // xóa trạng thái chờ
  };

  // ── Đóng popup (X) → hủy toàn bộ session ──
  const handleCloseTimer = () => {
    setActiveSession(null);
    // Không xóa waitingNextSet ở đây vì X chỉ đóng popup đang mở
  };

  return (
    <>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          {/* ── HEADER ── */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <PlayCircle size={20} className="text-emerald-400" />
              Buổi tập hôm nay
            </h2>
            <button
              className="bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition"
              onClick={() => setShowLibrary(true)}
            >
              + Thêm bài tập
            </button>
          </div>

          {/* ── DANH SÁCH BÀI TẬP ── */}
          {exercisesList.length > 0 ? (
            <div className="space-y-4">
              {exercisesList.map((exercise, exerciseIndex) => {
                const completedSets = exercise.sets.filter(
                  (s) => s.completed_reps != null
                ).length;
                const totalSets = exercise.sets.length;
                const nextPendingSet = exercise.sets.find(
                  (s) => s.completed_reps == null
                );
                const progress = Math.round((completedSets / totalSets) * 100);
                const isCompleted = completedSets === totalSets;

                // Popup đang mở cho bài tập này?
                const isActive = activeSession?.exerciseIndex === exerciseIndex;

                // Đang chờ nghỉ giữa set của bài tập này?
                const isWaiting = waitingNextSet?.exerciseIndex === exerciseIndex;

                return (
                  <motion.div
                    key={exercise.workout_plan_item_id}
                    whileHover={{ scale: 1.01 }}
                    className={`
                      rounded-2xl border p-5 transition-all
                      ${isCompleted
                        ? "bg-emerald-500/15 border-emerald-400/30"
                        : isActive || isWaiting
                        ? "bg-cyan-500/10 border-cyan-400/40"
                        : "bg-white/5 border-white/10"
                      }
                    `}
                  >
                    {/* Tên + độ khó */}
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
                              px-3 py-1 rounded-full text-xs font-semibold
                              ${exercise.difficulty === "easy"
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
                        <CheckCircle2 size={28} className="text-emerald-400" />
                      )}
                    </div>

                    {/* Ô hiển thị từng set */}
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {exercise.sets.map((set) => (
                        <div
                          key={set.workout_set_id}
                          className={`
                            rounded-xl p-3 text-center
                            ${set.completed_reps != null
                              ? "bg-emerald-500/20 border border-emerald-400/30"
                              : "bg-white/5"
                            }
                          `}
                        >
                          <p className="text-xs text-gray-400 mb-1">
                            Set {set.set_number}
                          </p>
                          <p className="font-bold text-sm">
                            {set.completed_reps != null
                              ? `✓ ${set.completed_reps} reps`
                              : `${set.target_reps} reps`}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Thanh tiến độ */}
                    <div className="mt-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Set {completedSets}/{totalSets}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        />
                      </div>

                      {nextPendingSet && !isCompleted && (
                        <p className="mt-2 text-sm text-cyan-300">
                          Tiếp theo: Set {nextPendingSet.set_number} •{" "}
                          {nextPendingSet.target_reps} reps
                        </p>
                      )}

                      {isCompleted && exercise.active_duration_seconds != null && (
                        <p className="mt-2 text-sm text-emerald-300">
                          ⏱ Tổng thời gian tập:{" "}
                          {formatTime(exercise.active_duration_seconds)}
                        </p>
                      )}
                    </div>

                    {/* ── Nút bấm – 4 trạng thái ── */}
                    <div className="mt-5 flex justify-end">
                      {isCompleted ? (
                        // Trạng thái 1: đã xong hết
                        <button
                          disabled
                          className="bg-emerald-500/50 text-white px-5 py-2 rounded-xl cursor-not-allowed"
                        >
                          Đã hoàn thành
                        </button>
                      ) : isActive ? (
                        // Trạng thái 2: popup đang mở
                        <span className="text-cyan-400 text-sm animate-pulse">
                          ⏱ Đang chạy Set {activeSession.setIndex + 1}...
                        </span>
                      ) : isWaiting ? (
                        // Trạng thái 3: xong 1 set, chờ nghỉ rồi bấm tiếp
                        <button
                          onClick={handleContinueNextSet}
                          className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-5 py-2 rounded-xl transition"
                        >
                          ▶ Tiếp tục Set {waitingNextSet.nextSetIndex + 1}
                        </button>
                      ) : (
                        // Trạng thái 4: chưa bắt đầu
                        <button
                          onClick={() => handleStart(exerciseIndex)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-5 py-2 rounded-xl transition"
                        >
                          ▶ Bắt đầu
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              Chưa có bài tập nào. Bấm "+ Thêm bài tập" để bắt đầu!
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

      {/* ── LIBRARY MODAL ── */}
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