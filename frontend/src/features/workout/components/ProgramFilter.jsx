import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import ProgramTemplateDetail from "./ProgramTemplateDetail"
import { GetWorkoutProgramTemplatesApi } from "../api/WorkoutProgramsApi"

export default function ProgramFilter({ 
  devMode,
  setWeekPrograms, 
  weekStart, 
  currentDate,
}) {
  const [defineProgramTemplate, setDefineProgramTemplate] = useState([]);
  const [showProgramTemplateDetail, setShowProgramTemplateDetail] = useState(false);
  const [selectedProgramTemplate, setSelectedProgramTemplate] = useState({}); 

  useEffect(() => {
    const loadApi = async () => {
      try {
        const response = await GetWorkoutProgramTemplatesApi(devMode);
        setDefineProgramTemplate(response || []);
      } catch (err) {
        console.error("Lỗi WorkoutProgramsApi: ", err);
      }
    }
    loadApi();
  }, [devMode]);

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
      <div className="relative w-full mt-8 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-4 px-4">
          <Activity size={18} className="text-emerald-500" />
          <h3 className="text-zinc-200 font-bold text-sm uppercase tracking-wider">Mẫu Lộ Trình</h3>
        </div>

        <div className="relative w-full">
          {/* LEFT BUTTON */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20
            bg-zinc-950 border border-zinc-800 text-zinc-400
            shadow-xl rounded-full w-10 h-10
            flex items-center justify-center
            hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          {/* SCROLL AREA */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth
            px-12 py-2 no-scrollbar"
          >
            {defineProgramTemplate.map((item) => {
              const isSelected = selectedProgramTemplate["id"] === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedProgramTemplate(item);
                    setShowProgramTemplateDetail(true);
                  }}
                  className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer border
                  ${
                    isSelected
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)] scale-105"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {item.name}
                </button>
              )
            })}
          </div>

          {/* RIGHT BUTTON */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20
            bg-zinc-950 border border-zinc-800 text-zinc-400
            shadow-xl rounded-full w-10 h-10
            flex items-center justify-center
            hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <ProgramTemplateDetail
        devMode={devMode}
        showProgramTemplateDetail={showProgramTemplateDetail} 
        setShowProgramTemplateDetail={setShowProgramTemplateDetail}
        selectedProgramTemplate={selectedProgramTemplate}
        setWeekPrograms={setWeekPrograms}
        currentDate={currentDate}
        weekStart={weekStart}
      />
    </>
  );
}