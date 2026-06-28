import { BASE_URL } from "../../../services/JsonApi"
import { useState, useEffect } from "react"
import { GetExcercisesLibraryApi } from "../api/LibraryProgramApi"
import { InsertWorkoutExercisesApi } from "../api/WorkoutProgramsApi"

export default function LibraryProgram({
  devMode,
  showLibrary, setShowLibrary, // biến cho phép mở đóng UI thư viện món ăn
  setExercisesList,
  selectedDay, // dùng để thêm một bài tập nào đó vào đúng ngày
  planDate, weekStart
}) {
  const [open, setOpen] = useState(false)

  // =======================================================================================================================================
  // ========================= chức năng lấy các bài tập trong thư viện bằng categoryName  ================================================
  // =======================================================================================================================================
  const [categoryName, setCategoryName] = useState("chest"); // dùng để lọc theo category_name
  const [exercisesLibrary, setExercisesLibrary] = useState([]); // biến chứa toàn bộ thư viện bài tập tải lên  
  // API load thư viện bài tập
  useEffect(() => {
    const loadApi = async () => {
      try {
        const response = await GetExcercisesLibraryApi(devMode, categoryName)

        setExercisesLibrary(response)
      } catch (err) {
        console.error("Lỗi API thư viện bài tập: ", err)
      }
    }

    loadApi()
  }, [categoryName])

  // =======================================================================================================================================
  // ========================= chức năng thêm bài tập trong tư viện vào schedule của user  ================================================
  // =======================================================================================================================================
  const [selectedExcercises, setSelectedExcercises] = useState([]) // biến lưu một hoặc nhiều nhiều bài tập khi bấm chọn 
  // State cho popup nhập thông tin
  const [exerciseConfigPopup, setExerciseConfigPopup] = useState(false)

  const [exerciseForm, setExerciseForm] = useState({  // biến lưu các thông số cấu hình khi người dùng chọn bài ()
    exercise_id: null,
    sets: 3,
    reps: [],
  })
  const [step, setStep] = useState(1) // lưu lại các bước của popup nhập set, rep
  const [currentSet, setCurrentSet] = useState(0) // lưu bước thực tế

  const [previewExercise, setPreviewExercise] = useState(null) // biến lưu một bài tập để preview
  const [search, setSearch] = useState(""); // biến để  tìm kiếm bài tập

  const handleSelectExercise = (exercise) => {
    const defaultSets = exercise.sets || 3;

    setExerciseForm({
      exercise_id: exercise.id,
      sets: defaultSets,
      reps: Array(defaultSets).fill("")
    })
    
    setStep(1)
    setCurrentSet(0)
    setExerciseConfigPopup(true)
  }

  // hàm khi user đổi sets (ví dụ: user chọn 5 set)
  const handleSetChange = (value) => {
    setExerciseForm(prev => ({
        ...prev,
        sets: value,
        reps: Array(value).fill(prev.rep[0] ?? "")
    }));
  }

  // khi nhập set đầu
  const handleRepChange = (value) => {
    const reps = [...exerciseForm.reps];

    reps[currentSet] = value;

    // Nếu đang ở Set đầu thì cập nhật default cho các set sau
    if (currentSet === 0) {
        for (let i = 1; i < reps.length; i++) {
            if (reps[i] === "" || reps[i] == null) {
                reps[i] = value;
            }
        }
    }

    setExerciseForm({
        ...exerciseForm,
        reps
    });
  }

  // Hàm lưu từ popup
  const saveExerciseConfig = () => {
    const exists = selectedExcercises.find(
      (e) => e.exercise_id === exerciseForm.exercise_id
    )
  
    if (exists) {
      alert("Bài tập này đã được chọn")
      return
    }
  
    setSelectedExcercises((prev) => [
      ...prev,
      {
        exercise_id: exerciseForm.exercise_id,
        sets: exerciseForm.sets,
        reps: exerciseForm.reps,
      }
    ])
  
    setExerciseConfigPopup(false)
    setStep(1)
    setCurrentSet(0)
    setExerciseForm({
      exercise_id: null,
      sets: 3,
      reps: []
    });
  }
  // API thêm bài tập vào schedule của user bằng exercise_id
  const handleAddExercises = () => {
    if (selectedExcercises.length === 0) return

    const loadApi = async () => {
      const res = await InsertWorkoutExercisesApi(
        devMode,
        planDate.toISOString().split("T")[0],
        weekStart, 
        selectedExcercises
      )

      if (res){
        alert("thêm thành công!")
      }
    }

    loadApi(); 
  }

  return (
    <>
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50 top-18">
          {/* SIDE PANEL */}
          <div className="w-[55%] bg-white/90 backdrop-blur-xl shadow-2xl overflow-y-auto p-8 animate-slideLeft rounded-l-sm">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-sky-900 tracking-wide">
                Thư viện bài tập
              </h2>

              <button
                onClick={() => setShowLibrary(false)}
                className="text-2xl text-slate-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-slate-500">
                Đã chọn {selectedExcercises.length} bài tập
              </p>

              {/* nút bấm để thêm danh sách đã chọn vào workoutPrograms */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleAddExercises}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Thêm {selectedExcercises.length} bài tập
                </button>
              </div>
            </div>

            {/* FILTER */}
            <div className="flex gap-4 mb-8">
              <input
                type="text"
                placeholder="Tìm bài tập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sky-950 flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none transition shadow-sm"
              />

              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="text-sky-950 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none transition shadow-sm"
              >
                <option value="chest">Bài tập ngực</option>
                <option value="gain_muscle">Tăng cơ</option>
                <option value="strength_training">Tăng sức mạnh</option>
                <option value="fat_loss_cardio">Giảm mỡ đốt calo</option>
                <option value="core_training">Cơ bản</option>
                <option value="mobility_stretching">Giãn cơ</option>
                <option value="warm_up">Khởi động làm nóng</option>
              </select>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-3 gap-6">
              {exercisesLibrary.map((excercise) => {
                const isSelected = selectedExcercises.some(
                  (e) => e.name === excercise.name
                )

                return (
                  <div
                    key={excercise.id}
                    className={`group bg-white rounded-2xl shadow-md transition duration-300 overflow-hidden hover:-translate-y-2 
                    ${isSelected ? "ring-2 ring-indigo-500" : ""}
                    `}
                  >

                    <div className="relative overflow-hidden">
                      <img
                        src={`${BASE_URL}${excercise.image_url}`}
                        alt={excercise.name}
                        className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-semibold text-lg text-sky-900">
                        {excercise.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {excercise.muscle_group} {excercise.calories_per_minute}Kcal/Min
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {excercise.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-3">
                        <button
                          onClick={() => {
                            setPreviewExercise(excercise)
                            setOpen(true)
                          }}
                          className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                        >
                          Chi tiết
                        </button>

                        <button
                          onClick={() => handleSelectExercise(excercise)}
                          className="text-xs px-3 py-1.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition shadow"
                        >
                          Chọn bài tập này
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

          </div>
        </div>
      )}

      {/* phần popup khi nhấn nút */}
      <LibrariesPopup
        open={open}
        setOpen={setOpen}
        excercise={previewExercise}
      />

      {/* Popup cấu hình bài tập */}
      {exerciseConfigPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-[500px] rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <button
                onClick={() => {
                  setExerciseConfigPopup(false)
                  setStep(1)
                  setCurrentSet(0)
                }}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-white">
                Cấu hình bài tập
              </h2>

              <p className="text-indigo-100 mt-1">
                {step === 1
                  ? "Bước 1 / 2 • Thiết lập chung"
                  : `Bước 2 / 2 • Set ${currentSet + 1}/${exerciseForm.sets}`}
              </p>
            </div>

            {/* Progress */}
            <div className="px-6 pt-4">
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{
                    width:
                      step === 1
                        ? "50%"
                        : `${((currentSet + 1) / exerciseForm.sets) * 50 + 50}%`
                  }}
                />
                </div>
              </div>

              {/* ================= BODY ================= */}
              <div className="p-6">
                {step === 1 ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block mb-2 font-semibold text-slate-700">
                        Số Sets
                      </label>

                      <input
                        type="number"
                        min={1}
                        value={exerciseForm.sets}
                        onChange={(e) =>
                          handleSetChange(Number(e.target.value))
                        }
                        className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-indigo-600">
                        {currentSet + 1}
                      </div>

                      <div className="text-slate-600 mt-2">
                        Set {currentSet + 1} / {exerciseForm.sets}
                      </div>
                    </div>
                  <div>

                  <label className="block mb-2 font-semibold text-slate-700">
                    Số Reps
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={exerciseForm.reps[currentSet] ?? ""}
                    onChange={(e) =>
                      handleRepChange(Number(e.target.value))
                    }
                    className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-center text-2xl font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  />
              </div>

            {currentSet > 0 && (

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">

                💡 Mặc định đã lấy số reps từ Set đầu tiên.
                Bạn có thể sửa nếu muốn.

              </div>

            )}

                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t bg-slate-50 px-6 py-5 flex justify-between">
                <button
                  onClick={() => {
                    if (step === 1) {
                      setExerciseConfigPopup(false)
                      setStep(1)
                      setCurrentSet(0)
                    } else {
                      if (currentSet === 0) {
                        setStep(1)
                      } else {
                        setCurrentSet(currentSet - 1)
                      }
                    }
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {step === 1 ? "Hủy" : "← Quay lại"}
                </button>

                {step === 1 ? (
                  <button
                    onClick={() => {
                      setExerciseForm(prev => ({
                        ...prev,
                        reps: Array(prev.sets).fill("")
                      }))
                      setCurrentSet(0)
                      setStep(2)
                    }}
                    className="rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700 transition shadow-lg"
                  >
                    Tiếp tục →
                  </button>
                ) : currentSet === exerciseForm.sets - 1 ? (
                  <button
                    onClick={saveExerciseConfig}
                    className="rounded-xl bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700 transition shadow-lg"
                  >
                    ✓ Lưu bài tập
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentSet(currentSet + 1)}
                    className="rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700 transition shadow-lg"
                  >
                    Set tiếp →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  )
}

function LibrariesPopup({ open, setOpen, excercise }) {
  if (!open || !excercise) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      
      <div className="bg-white w-350 max-w-[95%] rounded-2xl shadow-2xl overflow-hidden px-10 py-5">

        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b">
          <h2 className="text-2xl font-bold text-sky-900">
            {excercise.name}
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-red-500 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2">

          {/* VIDEO */}
          <div className="bg-black flex items-center justify-center p-4">
            <iframe
              className="w-full aspect-video rounded-lg"
              src={excercise.video_url.replace("watch?v=", "embed/")}
              title={excercise.name}
              allowFullScreen
            />
          </div>

          {/* CONTENT */}
          <div className="p-8 overflow-y-auto max-h-150 space-y-5">

            <p className="text-slate-600 text-lg">
              {excercise.description}
            </p>

            <div className="text-base text-slate-600 space-y-3">

              <p>
                <b>Nhóm cơ:</b> {excercise.muscle_group}
              </p>

              <p>
                <b>Calories / phút:</b> {excercise.calories_per_minute}
              </p>

              <p>
                <b>Độ khó:</b> {excercise.difficulty}
              </p>

              <p>
                <b>Sets:</b> {excercise.sets}
              </p>

              <p>
                <b>Reps:</b> {excercise.reps}
              </p>

              <p>
                <b>Thời gian:</b> {excercise.duration_minutes ?? excercise.durarion_minutes} phút
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}