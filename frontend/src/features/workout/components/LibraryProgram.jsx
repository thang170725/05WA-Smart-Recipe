//
// ======== nơi import thư viện ===========
//
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Dumbbell, Filter, Info } from "lucide-react";
import { GetExcercisesLibraryApi } from "../api/LibraryProgramApi"
import { BASE_URL } from "../../../services/JsonApi";
// import { GetExercisesApi, AddExerciseToPlanApi } from "../api/WorkoutProgramsApi";

const CATEGORIES = JSON.parse(import.meta.env.VITE_EXERCISE_CATEGORIES || "[]");

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

  //
  // ========= chức năng lọc các bài tập theo category name ==========
  //
  const [categoryName, setCatgoryName] = useState(CATEGORIES[0]?.key || "chest");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // quản lý bật/tắt Menu Dropdown

  //
  // ========= chức năng xem chi tiết 1 bài tập bất kỳ trong thư viện bài tập ==========
  //
  const [selectedDetailExercise, setSelectedDetailExercise] = useState(null);

  useEffect(() => {
    if (showLibrary) {
      const loadApi = async () => {
        const libraries = await GetExcercisesLibraryApi(devMode, categoryName)
        if (libraries) {
          setExercises(libraries);
        } else {
          alert('LỖI LẪY DỮ LIỆU BÀI TẬP')
        }
      }

      loadApi()
      
    }
  }, [showLibrary, categoryName]);

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

                <div className="relative">
  {/* Nút bật/tắt Filter */}
  <button 
    onClick={() => setIsFilterOpen((prev) => !prev)}
    className={`bg-zinc-900 border px-4 py-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
      isFilterOpen || categoryName !== CATEGORIES[0]?.key
        ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
    }`}
  >
    <Filter size={18} />
  </button>

  {/* Dropdown Menu xổ xuống */}
  <AnimatePresence>
    {isFilterOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-2 z-50 backdrop-blur-md"
      >
        <div className="text-xs font-semibold text-zinc-500 px-3 py-2 uppercase tracking-wider">
          Lọc theo danh mục
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = categoryName === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setCatgoryName(cat.key);
                  setIsFilterOpen(false); // Chọn xong tự đóng menu
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                <span>{cat.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
                
              </div>

              {/* Thanh lọc Category */}
              {/* Thanh lọc Category ngang */}
<div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
  {CATEGORIES.map((cat) => {
    const isActive = categoryName === cat.key;
    return (
      <button
        key={cat.key}
        onClick={() => setCatgoryName(cat.key)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
          isActive
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm"
            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
        }`}
      >
        {cat.label}
      </button>
    );
  })}
</div>
            </div>

            {/* Grid bài tập */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((ex) => (
  <div
    key={ex.id}
    className="group flex gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all"
  >
    {/* Hiển thị Ảnh đại diện */}
    <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 overflow-hidden">
      {ex.image_url ? (
        <img
          src={`${BASE_URL}/${ex.image_url}`}
          alt={ex.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-600">
          <Dumbbell size={24} />
        </div>
      )}
    </div>

    {/* Nội dung bài tập */}
    <div className="flex-1 min-w-0">
      <h3 className="text-zinc-100 font-bold text-base capitalize truncate group-hover:text-emerald-400 transition-colors">
        {ex.name}
      </h3>
      
      {/* Mô tả ngắn */}
      <p className="text-xs text-zinc-400 line-clamp-2 my-1">
        {ex.description || "Chưa có mô tả"}
      </p>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800 capitalize">
          {ex.muscle_group}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium capitalize ${
          ex.difficulty === "easy" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
          ex.difficulty === "medium" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
          "text-red-400 bg-red-500/10 border-red-500/20"
        }`}>
          {ex.difficulty}
        </span>
      </div>
    </div>

    {/* Nút thao tác: Chi tiết & Thêm */}
    <div className="flex flex-col justify-between items-end shrink-0 gap-2">
      <button
        onClick={() => setSelectedDetailExercise(ex)}
        className="text-zinc-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Xem chi tiết"
      >
        <Info size={18} />
      </button>

      <button
        onClick={() => handleAddExercise(ex)}
        className="bg-zinc-950 text-emerald-500 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 p-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
      >
        <Plus size={18} />
      </button>
    </div>
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

      {/* Modal Chi Tiết Bài Tập */}
{selectedDetailExercise && (
  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative space-y-4"
    >
      <button
        onClick={() => setSelectedDetailExercise(null)}
        className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <X size={18} />
      </button>

      {/* Ảnh lớn */}
      <div className="w-full h-48 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
        {selectedDetailExercise.image_url ? (
          <img
            src={`${BASE_URL}/${selectedDetailExercise.image_url}`}
            alt={selectedDetailExercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Dumbbell size={48} className="text-zinc-700" />
        )}
      </div>

      <h3 className="text-2xl font-bold text-zinc-100 capitalize">
        {selectedDetailExercise.name}
      </h3>

      <div className="flex gap-2">
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg capitalize">
          Nhóm cơ: {selectedDetailExercise.muscle_group}
        </span>
        <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-lg capitalize">
          Mức độ: {selectedDetailExercise.difficulty}
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-zinc-400">Mô tả bài tập:</h4>
        <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
          {selectedDetailExercise.description || "Chưa có mô tả chi tiết cho bài tập này."}
        </p>
      </div>

      <button
        onClick={() => {
          handleAddExercise(selectedDetailExercise);
          setSelectedDetailExercise(null);
        }}
        className="w-full py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
      >
        Thêm bài tập này vào lịch
      </button>
    </motion.div>
  </div>
)}
    </AnimatePresence>
  );
}