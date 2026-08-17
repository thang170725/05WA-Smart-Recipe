import { FormatDate, GetStartOfWeek } from "../../../components/Datetime"
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function WeekNavigator({
  currentDate, setCurrentDate,
  selectedDay, setSelectedDay,
  weekPrograms,
  weekStart,
}) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dayIndexMap = { Mon:0, Tue:1, Wed:2, Thu:3, Fri:4, Sat:5, Sun:6 };

  const handleSelectDay = (day) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + dayIndexMap[day]);
    setSelectedDay(day);
    setCurrentDate(newDate);
  }

  const getDateOfDay = (day)=>{
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIndexMap[day]);
    return d.getDate();
  }

  const getWorkoutCount = (day)=>{
    if(!weekPrograms?.week_menu) return 0;
    return weekPrograms.week_menu[day]?.length || 0;
  }

  return (
    <div className="bg-zinc-900/80 rounded-3xl p-6 border border-zinc-800 backdrop-blur-md shadow-xl">
      {/* WEEK HEADER */}
      <div className="flex items-center justify-between mb-8">
        <button
          className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 p-2 rounded-xl transition-colors cursor-pointer"
          onClick={()=>{
            setCurrentDate(prev=>{
              const d = new Date(prev);
              d.setDate(d.getDate()-7);
              return d;
            })
          }}
        >
          <ChevronLeft size={20}/>
        </button>

        <div className="text-sm text-zinc-300 font-bold tracking-widest uppercase bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800/50">
          {FormatDate(currentDate)}
        </div>

        <button
          className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 p-2 rounded-xl transition-colors cursor-pointer"
          onClick={()=>{
            setCurrentDate(prev=>{
              const d = new Date(prev);
              d.setDate(d.getDate()+7);
              return d;
            })
          }}
        >
          <ChevronRight size={20}/>
        </button>
      </div>

      {/* DAY GRID */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 justify-items-center">
        {days.map((day)=>{
          const workoutCount = getWorkoutCount(day);
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={()=>handleSelectDay(day)}
              className={`
                relative w-12 h-16 sm:w-16 sm:h-20 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer
                ${
                  isSelected
                  ? "bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-emerald-500/30 hover:text-zinc-200"
                }
              `}
            >
              {/* DAY */}
              <span className={`text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-1 ${isSelected ? "text-zinc-900/70" : "text-zinc-500"}`}>
                {day}
              </span>

              {/* DATE */}
              <span className={`text-lg sm:text-xl font-extrabold ${isSelected ? "text-zinc-950" : "text-zinc-300"}`}>
                {getDateOfDay(day)}
              </span>

              {/* WORKOUT DOTS */}
              {workoutCount > 0 && (
                <div className="absolute bottom-2 flex gap-1">
                  {Array.from({length:Math.min(workoutCount,3)}).map((_,i)=>(
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-zinc-950" : "bg-emerald-500"}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}