import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Dumbbell, Filter } from "lucide-react";
// import { GetExercisesApi, AddExerciseToPlanApi } from "../api/WorkoutProgramsApi";

export default function LibraryProgram({
  devMode,
  showLibrary,
  setShowLibrary,
  setExercisesList,
  selectedDay,
  planDate,
  weekStart,
}) {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (showLibrary) {
      // Giả lập load danh sách bài tập từ API
      setExercises([
        { id: 1, name: "Decline Pushups", target: "Ngực", difficulty: "Medium" },
        { id: 2, name: "Dumbbell Pullovers", target: "Ngực/Lưng", difficulty: "Hard" },
        { id: 3, name: "Squat", target: "Chân", difficulty: "Hard" },
        { id: 4, name: "Pull-ups", target: "Lưng", difficulty: "Medium" },
      ]);
    }
  }, [showLibrary]);

  const handleAddExercise = async (exercise) => {
    // Logic thêm bài tập vào ngày đang chọn
    // const newEx = await AddExerciseToPlanApi(...);
    // setExercisesList(prev => [...prev, newEx]);
    setShowLibrary(false);
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[2rem] h-[85vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header & Search */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                  <Dumbbell className="text-emerald-500" />
                  Thư viện bài tập
                </h2>
                <button
                  onClick={() => setShowLibrary(false)}
                  className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative flex gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài tập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <button className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {/* Grid bài tập */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="group flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all"
                  >
                    <div>
                      <h3 className="text-zinc-100 font-bold mb-1 text-lg group-hover:text-emerald-400 transition-colors">
                        {ex.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                          {ex.target}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-md border font-medium ${
                          ex.difficulty === "Hard" ? "text-red-400 bg-red-500/10 border-red-500/20" : 
                          "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                        }`}>
                          {ex.difficulty}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddExercise(ex)}
                      className="bg-zinc-950 text-emerald-500 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 p-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                  Không tìm thấy bài tập nào phù hợp.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}