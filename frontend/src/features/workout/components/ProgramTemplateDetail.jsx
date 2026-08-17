import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
// import { ApplyWorkoutProgramTemplateApi } from "../api/WorkoutProgramsApi"; // Tuỳ chỉnh theo API thực tế của bạn

export default function ProgramTemplateDetail({
  devMode,
  showProgramTemplateDetail,
  setShowProgramTemplateDetail,
  selectedProgramTemplate,
  setWeekPrograms,
  currentDate,
  weekStart,
}) {
  const handleApply = async () => {
    try {
      // Gọi API ApplyTemplate tại đây
      // const res = await ApplyWorkoutProgramTemplateApi(...);
      // setWeekPrograms(res);
      setShowProgramTemplateDetail(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedProgramTemplate || !selectedProgramTemplate.id) return null;

  return (
    <AnimatePresence>
      {showProgramTemplateDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full sm:max-w-2xl bg-zinc-950 border border-zinc-800 sm:rounded-[2rem] rounded-t-[2rem] h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">
                    {selectedProgramTemplate.name}
                  </h2>
                  <p className="text-sm text-zinc-400">Chi tiết lộ trình tập luyện</p>
                </div>
              </div>
              <button
                onClick={() => setShowProgramTemplateDetail(false)}
                className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nội dung cuộn */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {/* Giả lập danh sách các ngày trong lộ trình */}
              {[1, 2, 3, 4, 5].map((day) => (
                <div
                  key={day}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider">
                      Ngày {day}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">3 Bài tập</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-zinc-300 text-sm">
                      <ChevronRight size={14} className="text-zinc-600" /> Pushups (3 sets x 12 reps)
                    </li>
                    <li className="flex items-center gap-2 text-zinc-300 text-sm">
                      <ChevronRight size={14} className="text-zinc-600" /> Bench Press (4 sets x 8 reps)
                    </li>
                    <li className="flex items-center gap-2 text-zinc-300 text-sm">
                      <ChevronRight size={14} className="text-zinc-600" /> Dumbbell Flyes (3 sets x 10 reps)
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950">
              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 size={20} />
                Áp dụng lộ trình này
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}