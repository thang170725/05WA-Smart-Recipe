import { useState, useEffect } from "react";
import WorkoutPanel from "../features/workout/components/WorkoutPanel";
import Header from "../features/workout/components/Header";
import WeeklyNavigator from "../features/workout/components/WeeklyNavigator"
import ProgramFilter from "../features/workout/components/ProgramFilter"
import { FormatDate, GetStartOfWeek } from "../components/Datetime"
import { GetExercisesListApi } from "../features/workout/api/WorkoutProgramsApi"

export default function WorkoutRoadmap() {
  // chế độ
  const devMode = "production"

  // xử lý menu ngày
  const dayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // ngày dạng chữ
  const [selectedDay, setSelectedDay] = useState(dayStr[new Date().getDay()]); // ngày mà hệ thống focus đến (dạng chữ)
  

  // xử lý thư viện bài tập
  const [showLibrary, setShowLibrary] = useState(false); // cho phép đóng mở thư viện món ăn
  
  // =======================================================================================================================================
  // ========================= chức năng hiển thị các bài tập của user bằng planDate  ====================================================
  // =======================================================================================================================================
  const [exercisesList, setExercisesList] = useState([]) // biến chính lưu danh sách các bài tập
  const [currentDate, setCurrentDate] = useState(new Date()) // ngày hiện tại hoặc ngày mà website focus
  const weekStart = FormatDate(GetStartOfWeek(currentDate)) // ngày đầu tiên trong tuần dạng YY-MM-DD
  // API load lịch tập trong 1 ngày
  useEffect(() => {
    const loadApi = async () => {
      try {
        const response = await GetExercisesListApi(devMode, 
          currentDate.toISOString().split("T")[0]
        )

        console.log("GetExercisesListApi", response)
        setExercisesList(response)
      } catch (err) {
        console.error("Lỗi Week")
      }
    }

    loadApi();
  }, [currentDate])
  
  return (
    <section className="page-shell text-white space-y-6">
      {/* tiêu đề */}
      <Header />

      {/* menu lựa chọn các bài tập mẫu */}
      <ProgramFilter 
        devMode={devMode}
        setExercisesList={setExercisesList} // lưu lịch 1 tuần
        weekStart={weekStart} // ngày đầu tiên của tuần chứa currentDate (YY-MM-DD)
        currentDate={currentDate} // ngày mà hệ thống hoặc người dùng focus đến (YY-MM-DD)
      />

      {/* quản lý danh sách bài tập trong 1 tuần */}
      <div className="grid grid-cols-12 gap-8 mt-10">
        {/* LEFT COLUMN */}
        <div className="col-span-4">
          <WeeklyNavigator
            currentDate={currentDate} setCurrentDate={setCurrentDate} // lưu ngày select khi user chọn
            selectedDay={selectedDay} setSelectedDay={setSelectedDay} // ngày người dùng chọn trong nav lưu dưới dạng chữ
            exercisesList={exercisesList} // biến quản lý danh sách các bài tập trong 1 tuần
            weekStart={weekStart}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-8">
          <WorkoutPanel
            devMode={devMode}
            exercisesList={exercisesList} setExercisesList={setExercisesList} // biến quản lý danh sách các bài tập trong 1 tuần
            selectedDay={selectedDay}
            showLibrary={showLibrary} setShowLibrary={setShowLibrary}
            planDate={currentDate}
            weekStart={weekStart}
          />
        </div>
      </div>
    </section>
  );
}