import Libraries from "../features/meals/components/Libraries"
import Title from "../features/meals/components/Title"
import Weekly from "../features/meals/components/Weekly"
import { DateDetail } from "../components/Datetime"
import { useState, useEffect, useRef } from "react"

export default function Meals() {
  // chế độ
  const devMode = "production" 
  
  // xử lý thời gian
  const [currentDate, setCurrentDate] = useState(new Date()) // ngày hiện tại hoặc ngày mà website focus
  const dateDetail = DateDetail(currentDate) // chi tiết về  thời gian hiện tại hoặc website focus
  // xử lý menu ngày
  const dayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // ngày dạng chữ
  const [selectedDay, setSelectedDay] = useState(dayStr[new Date().getDay()]); // ngày mà hệ thống focus đến (dạng chữ)

  const [menuDay, setMenuDay] = useState([]) // thực đơn trong 1 ngày

  // Xử lý thư viện món ăn
  const [showLibrary, setShowLibrary] = useState(false); // cho phép đóng mở thư viện món ăn 
  const [selectedMealType, setSelectedMealType] = useState(null); // cho biết món được chọn sẽ nằm ở bữa nào. breakfast, lunch, v.v 
  const [search, setSearch] = useState(""); // biến để  tìm kiếm món ăn
  const [selectedMeal, setSelectedMeal] = useState("breakfast"); // state chọn meal (UI tab), lựa chọn breakfast, lunch, dinner

  return (
    <div className="page-shell space-y-6 text-white">
      <Title
          dateDetail={dateDetail}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
      />
      
      {/* LIST DANH SÁCH MÓN ĂN */}
      <Weekly
        devMode={devMode} // cài đặt chế độ dev hoặc production
        dateDetail={dateDetail} // quản lý chi tiết về thời gian
        currentDate={currentDate} setCurrentDate={setCurrentDate}
        setSelectedMealType={setSelectedMealType}
        setShowLibrary={setShowLibrary} // cho phép mở thư viện món ăn ra không
        selectedDay={selectedDay}
        week_start={dateDetail.dateStartInWeek}
        menuDay={menuDay} setMenuDay={setMenuDay} // thực đơn 1 ngày
        selectedMeal={selectedMeal} setSelectedMeal={setSelectedMeal}
      />
        
      <Libraries
        devMode={devMode} // cài đặt chế độ
        dateDetail={dateDetail} // quản lý thời gian
        showLibrary={showLibrary} setShowLibrary={setShowLibrary} // quản lý chế độ xem, cho phép đóng mở
        search={search} setSearch={setSearch}
        setMenuDay={setMenuDay}
        selectedDay={selectedDay}
        selectedMealType={selectedMealType}
        selectedMeal={selectedMeal} setSelectedMeal={setSelectedMeal}
      />
    </div>
  ) 
}
