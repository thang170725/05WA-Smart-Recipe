import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Title({
    dateDetail,
    setCurrentDate,
    selectedDay,
    setSelectedDay,
}) {
    if (!dateDetail) return null;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const dayIndexMap = {
        Mon: 0,
        Tue: 1,
        Wed: 2,
        Thu: 3,
        Fri: 4,
        Sat: 5,
        Sun: 6,
    };

    const normalizeDayIndex = (dayIndex) => {
        return dayIndex === 0 ? 6 : dayIndex - 1;
    };

    const todayIndex = normalizeDayIndex(
        new Date().getDay()
    );

    const selectedIndex =
        selectedDay === "Sun"
            ? 6
            : dayIndexMap[selectedDay];

    const handleSelectDay = (day) => {
        setSelectedDay(day);

        setCurrentDate((prev) => {
            const newDate = new Date(prev);

            const currentDayIndex = normalizeDayIndex(
                newDate.getDay()
            );

            const targetDayIndex =
                dayIndexMap[day];

            const diff =
                targetDayIndex -
                currentDayIndex;

            newDate.setDate(
                newDate.getDate() + diff
            );

            return newDate;
        });
    };

    const handleChangeWeek = (step) => {
        setCurrentDate((prev) => {
            const d = new Date(prev);

            d.setDate(
                d.getDate() + step * 7
            );

            return d;
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="page-title text-4xl mb-6">
                Kế hoạch bữa ăn tuần - Quản lý dinh dưỡng
            </h1>

            <div className="glass-panel overflow-hidden p-6 sm:p-8 mb-2">
                {/* WEEK NAV */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() =>
            handleChangeWeek(-1)
        }
        className="
            p-2
            rounded-full
            hover:bg-white/10
            transition
            cursor-pointer
        "
                    >
                        <ChevronLeft size={22} />
                    </button>

                    <div className="text-center font-bold">
                        <div className="text-xl text-slate-300">
                            {dateDetail.weekRangeFull}
                        </div>

                        <div className="text-md text-slate-500 mt-1">
                            {dateDetail.currentDateFull}
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            handleChangeWeek(1)
                        }
                        className="
                            p-2
                            rounded-full
                            hover:bg-white/10
                            transition
                            cursor-pointer
                        "
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>

                {/* DAY TIMELINE */}
                <div className="relative">
                    {/* đường nền */}
                    <div
                        className="
                            absolute
                            left-0
                            right-0
                            top-[45px]
                            h-[2px]
                            bg-white/10
                        "
                    />
                        {/* đường active */}
                        <div
                            className="
                                absolute
                                top-[45px]
                                left-0
                                h-[2px]
                                bg-[#E85D4A]
                                transition-all duration-300
                            "
                            style={{
                                width: `${(selectedIndex / 6) * 100}%`,
                            }}
                        />
                            <div className="grid grid-cols-7 gap-5 relative z-10">
                                {days.map((day, index) => {
                                    const weekDate = dateDetail.weekDates[index];
                                
                                    const isSelected =
                                        selectedIndex === index;
                                
                                    const isToday =
                                        todayIndex === index;
                                
                                    return (
                                        <button
                                            key={day}
                                            onClick={() =>
                                                handleSelectDay(day)
                                            }
                                            className={`
                                                rounded-2xl
                                                px-5 py-3
                                                w-20
                                                flex flex-col
                                                items-center
                                                transition-all duration-300
                                            
                                                ${
                                                    isSelected
                                                        ? "text-white shadow-lg scale-105 bg-gray-200/20"
                                                        : "hover:bg-white/5 hover:-translate-y-1"
                                                }
                                            `}
                                        >
                                            {/* thứ */}
                                            <span
                                                className={`
                                                    text-xs font-medium
                                                
                                                    ${
                                                        isSelected
                                                            ? "text-white"
                                                            : "text-slate-400"
                                                    }
                                                `}
                                            >
                                                {labels[index]}
                                            </span>
                                                
                                            {/* chấm timeline */}
                                            <div
                                                className={`
                                                    my-3
                                                    rounded-full
                                                    transition-all duration-300
                                                    
                                                    ${
                                                        isSelected
                                                            ? "w-5 h-5 bg-[#E85D4A] shadow-xl relative -top-1"
                                                            : isToday
                                                            ? "w-4 h-4 bg-amber-400 ring-4 ring-amber-400/20"
                                                            : "w-3 h-3 bg-white/30"
                                                    }
                                                `}
                                            />

                                            {/* ngày */}
                                            <span className="text-base font-semibold">
                                                {weekDate.date}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>          
                </div>        
    );
}