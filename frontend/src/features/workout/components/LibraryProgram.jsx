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
  const [exerciseForm, setExerciseForm] = useState({
    exercise_id: null,
    sets: "",
    reps: "",
    duration_minutes: "",
    order_index: ""
  })
  const [previewExercise, setPreviewExercise] = useState(null) // biến lưu một bài tập để preview
  const [search, setSearch] = useState(""); // biến để  tìm kiếm bài tập
  const handleSelectExercise = (exercise) => {
    setExerciseForm({
      exercise_id: exercise.id,
      sets: exercise.sets || "",
      reps: exercise.reps || "",
      duration_minutes: exercise.duration_minutes || "",
      order_index: selectedExcercises.length + 1
    })
  
    setExerciseConfigPopup(true)
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
        sets: Number(exerciseForm.sets),
        reps: Number(exerciseForm.reps),
        duration_minutes: Number(exerciseForm.duration_minutes),
        order_index: Number(exerciseForm.order_index)
      }
    ])
  
    setExerciseConfigPopup(false)
  }
  // thêm bài tập vào schedule của user bằng exercise_id
  const handleAddExercises = () => {
    if (selectedExcercises.length === 0) return

    const loadApi = async () => {
      const res = await InsertWorkoutExercisesApi(
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
                    key={excercise.name}
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
        {/* Popup nhập sets/reps */}
        {exerciseConfigPopup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl w-[450px] p-6 text-black">
              <h3 className="text-xl font-bold mb-5">
                Cấu hình bài tập
              </h3>

              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Sets"
                  value={exerciseForm.sets}
                  onChange={(e) =>
                    setExerciseForm({
                      ...exerciseForm,
                      sets: e.target.value
                    })
                  }
                  className="w-full border rounded p-2"
                />

                <input
                  type="number"
                  placeholder="Reps"
                  value={exerciseForm.reps}
                  onChange={(e) =>
                    setExerciseForm({
                      ...exerciseForm,
                      reps: e.target.value
                    })
                  }
                  className="w-full border rounded p-2"
                />

                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={exerciseForm.duration_minutes}
                  onChange={(e) =>
                    setExerciseForm({
                      ...exerciseForm,
                      duration_minutes: e.target.value
                    })
                  }
                  className="w-full border rounded p-2"
                />

                <input
                  type="number"
                  placeholder="Order"
                  value={exerciseForm.order_index}
                  onChange={(e) =>
                    setExerciseForm({
                      ...exerciseForm,
                      order_index: e.target.value
                    })
                  }
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setExerciseConfigPopup(false)}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>

                <button
                  onClick={saveExerciseConfig}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Lưu
                </button>
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