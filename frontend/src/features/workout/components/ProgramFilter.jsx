import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProgramTemplateDetail from "./ProgramTemplateDetail"
import { GetWorkoutProgramTemplatesApi } from "../api/WorkoutProgramsApi"

export default function ProgramFilter({ 
  devMode,
  setWeekPrograms, // lưu lịch 1 tuần
  weekStart, // ngày đầu tiên của tuần chứa currentDate (YY-MM-DD)
  currentDate,// ngày mà hệ thống hoặc người dùng focus đến (YY-MM-DD)
}) {

  const [defineProgramTemplate, setDefineProgramTemplate] = useState([]) // danh sách các chương trình tập luyên có list id và name
  const [showProgramTemplateDetail, setShowProgramTemplateDetail] = useState(false)
  const [selectedProgramTemplate, setSelectedProgramTemplate] = useState({}) // chương trình người dùng chọn có id, name dạng object

  useEffect(() => {
    const loadApi = async () => {
      try {
        const response = await GetWorkoutProgramTemplatesApi(devMode)
        setDefineProgramTemplate(response || [])
      } catch (err) {
        console.error("Lỗi WorkoutProgramsApi: ", err)
      }
    }

    loadApi()
  }, [])

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const amount = 280;

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="relative w-[95%] mt-10">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-20
          bg-white/10 backdrop-blur border border-white/20
          shadow-lg rounded-full w-10 h-10
          flex items-center justify-center
          hover:scale-110 transition"
        >
          <ChevronLeft size={18} />
        </button>

        {/* SCROLL AREA */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth
          px-10 py-3 no-scrollbar"
        >
          {defineProgramTemplate.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedProgramTemplate(item)
                setShowProgramTemplateDetail(true)
              }}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                selectedProgramTemplate["id"] === item.id
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-20
          bg-white/10 backdrop-blur border border-white/20
          shadow-lg rounded-full w-10 h-10
          flex items-center justify-center
          hover:scale-110 transition"
        >
          <ChevronRight size={18} />
        </button>

      </div>

      <ProgramTemplateDetail
        devMode={devMode}
        showProgramTemplateDetail={showProgramTemplateDetail} setShowProgramTemplateDetail={setShowProgramTemplateDetail}
        selectedProgramTemplate={selectedProgramTemplate}
        setWeekPrograms={setWeekPrograms}
        currentDate={currentDate}
        weekStart={weekStart}
      />
    </>
  );
}