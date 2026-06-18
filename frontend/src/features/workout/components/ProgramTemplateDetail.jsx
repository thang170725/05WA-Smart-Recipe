import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  GetWorkoutProgramTemplatesDetailApi,
  PostWorkoutProgramTemplatesDetailToWeekApi
} from "../api/WorkoutProgramsApi";
import { FormatDate } from "../../../components/Datetime"

// component format để có thể thêm được vào workoutpanel
export function FormatDetailToWeekList(programDetail, currentDate) {

  const dayMap = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

  const startDate = new Date(currentDate)

  const weeks = {}

  programDetail.days.forEach(dayObj => {

    const date = new Date(startDate)
    date.setDate(startDate.getDate() + (dayObj.day - 1))

    const dayKey = dayMap[date.getDay()]

    const weekStartDate = new Date(date)
    weekStartDate.setDate(date.getDate() - date.getDay() + 1)

    const weekStart = weekStartDate.toISOString().slice(0,10)

    if (!weeks[weekStart]) {
      weeks[weekStart] = {
        week_start: weekStart,
        week_menu: {
          Mon: [],
          Tue: [],
          Wed: [],
          Thu: [],
          Fri: [],
          Sat: [],
          Sun: []
        }
      }
    }

    dayObj.exercises.forEach(ex => {

      weeks[weekStart].week_menu[dayKey].push({
        name: ex.name,
        difficulty: ex.difficulty,
        calories_per_minute: ex.calories_per_minute,
        sets: ex.sets ?? null,
        reps: ex.reps ?? null,
        duration_minutes: ex.duration_minutes ?? null,
        order_index: ex.order_index
      })

    })

  })

  return Object.values(weeks)
}

export default function ProgramTemplateDeTail({
  devMode,
  showProgramTemplateDetail,
  setShowProgramTemplateDetail,
  selectedProgramTemplate,
  setWeekPrograms,
  currentDate,
  weekStart,
}) {

  const [workoutProgramTemplateDetail, setWorkoutProgramTemplateDetail] = useState({ days: [] });
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (!selectedProgramTemplate?.id) return;

    const loadApi = async () => {

      setLoading(true);
      setWorkoutProgramTemplateDetail({ days: [] });
      setSelectedDay(null);

      try {

        const response = await GetWorkoutProgramTemplatesDetailApi(
          devMode,
          selectedProgramTemplate.id
        );

        if (!response) {
          setWorkoutProgramTemplateDetail({ days: [] });
          setLoading(false);
          return;
        }

        setWorkoutProgramTemplateDetail(response);

        if (response.days?.length > 0) {
          setSelectedDay(response.days[0]);
        }

      } catch (err) {

        console.error("Load program detail error:", err);

      }

      setLoading(false);

    };

    loadApi();

  }, [selectedProgramTemplate, devMode]);


  const difficultyColor = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700"
  };


  const calculateDayCalories = (day) => {

    if (!day?.exercises) return 0;

    let total = 0;

    day.exercises.forEach(ex => {

      if (ex.calories_per_minute && ex.duration_minutes) {
        total += ex.calories_per_minute * ex.duration_minutes;
      }

      if (ex.calories_per_minute && ex.sets) {
        total += ex.calories_per_minute * ex.sets * 3;
      }

    });

    return Math.round(total);
  };

  // nút bấm thêm chương trình luyện tập vào lịch tập
  const handleAdd = () => {
    console.log("API workoutProgramTemplateDetail", currentDate, weekStart, workoutProgramTemplateDetail)
    const loadApi = async () => {
      const response = await PostWorkoutProgramTemplatesDetailToWeekApi(devMode, FormatDate(currentDate), weekStart, workoutProgramTemplateDetail)

      if (response === "success"){
        alert("Thêm thành công vào lịch tập")
      }
    }

    loadApi()
  }

  return (
    <AnimatePresence>

      {showProgramTemplateDetail && (
        <>

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setShowProgramTemplateDetail(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120 }}
            className="
            fixed top-18 right-0
            w-[36%] h-[92%]
            bg-white/95
            backdrop-blur
            z-50
            shadow-2xl
            rounded-l-3xl
            flex flex-col
            "
          >

            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-5">

              <div>

                <h2 className="font-bold text-xl text-gray-900">
                  {selectedProgramTemplate?.name || "Workout Program"}
                </h2>

                <p className="text-xs text-gray-400">
                  30 Day Training Plan
                </p>

              </div>

              <button
                onClick={() => setShowProgramTemplateDetail(false)}
                className="
                p-2
                rounded-full
                hover:bg-gray-100
                transition
                text-black hover:text-red-500
                "
              >
                <X size={20}/>
              </button>

            </div>



            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">

              {loading ? (

                <p className="text-gray-400 text-center py-10">
                  Loading program...
                </p>

              ) : workoutProgramTemplateDetail.days.length === 0 ? (

                <p className="text-center py-10">
                  Program not found
                </p>

              ) : (

                <>

                  {/* DAY SELECTOR */}
                  <div className="grid grid-cols-10 justify-between gap-3">

                    {workoutProgramTemplateDetail.days.map((day) => (
                      <div 
                        key={day.day}
                        className="flex justify-center">
                      <button
                        key={day.day}
                        onClick={() => setSelectedDay(day)}
                        className={`
                        px-4 py-2
                        rounded-full
                        text-[12px]
                        font-semibold
                        transition cursor-pointer
                        ${
                          selectedDay?.day === day.day
                          ? "bg-blue-600 text-white shadow-md text-[15px]"
                          : "bg-gray-100 hover:bg-gray-200 text-black"
                        }
                        `}
                      >
                        Day {day.day}
                      </button></div>

                    ))}

                  </div>

                  {selectedDay?.title && (
  <p className="text-center text-gray-500 text-sm">
    {selectedDay.title}
  </p>
)}

                  {/* DAY SUMMARY */}
                  {selectedDay && (

                    <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    px-5 py-2
                    flex justify-between
                    text-sm
                    text-black
                    ">

                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Exercises</p>
                        <p className="font-semibold text-lg text-black">
                          {selectedDay.exercises?.length || 0}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Estimated Burn</p>
                        <p className="font-semibold text-lg">
                          {calculateDayCalories(selectedDay)} kcal
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Difficulty</p>
                        <p className="font-semibold capitalize text-lg">
                          {selectedDay.exercises?.[0]?.difficulty || "-"}
                        </p>
                      </div>

                    </div>

                  )}

                  {/* EXERCISES */}
                  {selectedDay?.exercises?.length === 0 ? (

                    <div className="text-center py-10 text-black">
                      Rest Day
                    </div>

                  ) : (

                    <div className="space-y-4 text-black">

                      {selectedDay?.exercises
                        ?.sort((a,b)=>a.order_index-b.order_index)
                        ?.map((ex,i)=>{

                          const estimatedCalories =
                          ex.calories_per_minute && ex.duration_minutes
                          ? Math.round(ex.calories_per_minute * ex.duration_minutes)
                          : null;

                          return(

                            <motion.div
                              key={i}
                              whileHover={{
                                y:-4,
                                scale:1.02
                              }}
                              className="
                              bg-white
                              rounded-2xl
                              shadow-sm
                              hover:shadow-xl
                              transition
                              p-4
                              flex flex-col gap-3
                              "
                            >

                              {/* HEADER */}
                              <div className="flex justify-between items-center">

                                <div className="flex items-center gap-3">

                                  <div className="
                                  w-10 h-10
                                  flex items-center justify-center
                                  rounded-full
                                  bg-blue-100
                                  text-lg
                                  ">
                                    🏋️
                                  </div>

                                  <p className="font-semibold text-gray-800">
                                    {ex.name}
                                  </p>

                                </div>

                                <span
                                  className={`
                                  text-xs px-2 py-1 rounded-full font-medium
                                  ${difficultyColor[ex.difficulty]}
                                  `}
                                >
                                  {ex.difficulty}
                                </span>

                              </div>



                              {/* STATS */}
                              <div className="grid grid-cols-3 gap-2 text-sm">

                                {ex.sets && (
                                  <div className="
                                  bg-gray-50
                                  rounded-xl
                                  p-3
                                  text-center
                                  shadow-sm
                                  ">
                                    <p className="text-xs text-gray-400">Sets</p>
                                    <p className="font-semibold">{ex.sets}</p>
                                  </div>
                                )}

                                {ex.reps && (
                                  <div className="
                                  bg-gray-50
                                  rounded-xl
                                  p-3
                                  text-center
                                  shadow-sm
                                  ">
                                    <p className="text-xs text-gray-400">Reps</p>
                                    <p className="font-semibold">{ex.reps}</p>
                                  </div>
                                )}

                                {ex.duration_minutes && (
                                  <div className="
                                  bg-gray-50
                                  rounded-xl
                                  p-3
                                  text-center
                                  shadow-sm
                                  ">
                                    <p className="text-xs text-gray-400">Duration</p>
                                    <p className="font-semibold">
                                      {ex.duration_minutes} min
                                    </p>
                                  </div>
                                )}

                              </div>



                              {/* CALORIES */}
                              {ex.calories_per_minute && (

                                <div className="text-xs text-gray-500 flex justify-between">

                                  <span>
                                    🔥 {ex.calories_per_minute} kcal/min
                                  </span>

                                  {estimatedCalories && (
                                    <span>
                                      ≈ {estimatedCalories} kcal burn
                                    </span>
                                  )}

                                </div>

                              )}

                            </motion.div>

                          );

                        })}

                    </div>

                  )}

                </>

              )}

            </div>



            {/* FOOTER BUTTON */}
            <div className="p-6">

              <button
                onClick={handleAdd}
                className="
                w-full
                py-3
                rounded-2xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-semibold
                shadow-lg
                hover:shadow-xl
                transition
                "
              >
                Start This 30 Day Program
              </button>

            </div>

          </motion.div>

        </>
      )}

    </AnimatePresence>
  );
}