import { useState, useEffect } from "react";
import WorkoutPanel from "../features/workout/components/WorkoutPanel";
import Header from "../features/workout/components/Header";
import WeeklyNavigator from "../features/workout/components/WeeklyNavigator"
import { GetWeekProgramsApi } from "../features/workout/api/WeekProgramsApi";
import ProgramFilter from "../features/workout/components/ProgramFilter"
import { FormatDate, GetStartOfWeek } from "../components/Datetime"

export default function WorkoutRoadmap() {
  // chế độ
  const devMode = "production"

  // xử lý menu ngày
  const dayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // ngày dạng chữ
  const [selectedDay, setSelectedDay] = useState(dayStr[new Date().getDay()]); // ngày mà hệ thống focus đến (dạng chữ)
  const [currentDate, setCurrentDate] = useState(new Date()) // ngày hiện tại hoặc ngày mà website focus
  const weekStart = FormatDate(GetStartOfWeek(currentDate)) // ngày đầu tiên trong tuần dạng YY-MM-DD

  // xử lý thư viện bài tập
  const [showLibrary, setShowLibrary] = useState(false); // cho phép đóng mở thư viện món ăn
  
  // biến lưu tất cả chương trình tập trong 1 tuần
  const [weekPrograms, setWeekPrograms] = useState({
    week_start: FormatDate(GetStartOfWeek(currentDate)),
    week_menu: {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
    },
  })

  // API load lịch tập trong vòng 1 tuần theo week_start
  useEffect(() => {
    const loadApi = async () => {
      try {
        const reponse = await GetWeekProgramsApi(devMode, weekStart)

        setWeekPrograms(reponse)
      } catch (err) {
        console.error("Lỗi Week")
      }
    }

    loadApi();
  }, [currentDate])

  // Cập nhật dữ liệu
  useEffect(() => {
    console.log("Update week program: ", weekPrograms)
  }, [weekPrograms])
  
  return (
    <section className="page-shell text-white space-y-6">
      {/* tiêu đề */}
      <Header />

      {/* menu lựa chọn các bài tập mẫu */}
      <ProgramFilter 
        devMode={devMode}
        setWeekPrograms={setWeekPrograms} // lưu lịch 1 tuần
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
            weekPrograms={weekPrograms} // biến quản lý danh sách các bài tập trong 1 tuần
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-8">
          <WorkoutPanel
            devMode={devMode}
            weekPrograms={weekPrograms} setWeekPrograms={setWeekPrograms}// biến quản lý danh sách các bài tập trong 1 tuần
            selectedDay={selectedDay}
            showLibrary={showLibrary} setShowLibrary={setShowLibrary}
          />
        </div>
      </div>
    </section>
  );
}