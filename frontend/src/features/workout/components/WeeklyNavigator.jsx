import { FormatDate, GetStartOfWeek } from "../../../components/Datetime"
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function WeekNavigator({
  currentDate, setCurrentDate,
  selectedDay, setSelectedDay,
  weekPrograms,
  weekStart,
}) {

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

  const dayIndexMap = {
    Mon:0, Tue:1, Wed:2, Thu:3, Fri:4, Sat:5, Sun:6
  }

  const handleSelectDay = (day) => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + dayIndexMap[day])

    setSelectedDay(day)
    setCurrentDate(newDate)
  }

  const getDateOfDay = (day)=>{
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dayIndexMap[day])
    return d.getDate()
  }

  const getWorkoutCount = (day)=>{
    if(!weekPrograms?.week_menu) return 0
    return weekPrograms.week_menu[day]?.length || 0
  }

  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur">

      {/* WEEK HEADER */}
      <div className="flex items-center justify-between mb-6">

        <button
          className="hover:bg-white/10 p-2 rounded-full transition"
          onClick={()=>{
            setCurrentDate(prev=>{
              const d = new Date(prev)
              d.setDate(d.getDate()-7)
              return d
            })
          }}
        >
          <ChevronLeft size={20}/>
        </button>

        <div className="text-sm text-gray-300 font-medium tracking-wide">
          {FormatDate(currentDate)}
        </div>

        <button
          className="hover:bg-white/10 p-2 rounded-full transition"
          onClick={()=>{
            setCurrentDate(prev=>{
              const d = new Date(prev)
              d.setDate(d.getDate()+7)
              return d
            })
          }}
        >
          <ChevronRight size={20}/>
        </button>

      </div>

      {/* DAY GRID */}
      <div className="grid grid-cols-4 gap-4 justify-items-center">

        {days.map((day)=>{

          const workoutCount = getWorkoutCount(day)

          return (
            <button
              key={day}
              onClick={()=>handleSelectDay(day)}
              className={`
                relative
                w-14 h-14
                flex flex-col items-center justify-center
                rounded-full
                text-xs
                font-medium
                transition-all
                cursor-pointer

                ${
                  selectedDay === day
                  ? "bg-linear-to-r from-sky-500 to-cyan-300 text-slate-900 shadow-lg shadow-cyan-500/40 scale-110"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
                }
              `}
            >

              {/* DAY */}
              <span className="text-[11px] uppercase tracking-wide">
                {day}
              </span>

              {/* DATE */}
              <span className="text-sm font-semibold">
                {getDateOfDay(day)}
              </span>

              {/* WORKOUT DOT */}
              {workoutCount > 0 && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {Array.from({length:Math.min(workoutCount,3)}).map((_,i)=>(
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-cyan-300 rounded-full"
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