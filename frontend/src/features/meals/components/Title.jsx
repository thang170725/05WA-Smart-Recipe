import { ChevronLeft, ChevronRight, Flame, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { FormatDate, GetStartOfWeek } from "../../../components/Datetime";

export default function Title({
    dateDetail,
    currentDate, setCurrentDate,
    selectedDay,
    setSelectedDay,
    totalWeekCalories, setTotalWeekCalories
}) {
    if (!dateDetail) return null;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const dayIndexMap = {
        Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
    };

    const normalizeDayIndex = (dayIndex) => {
        return dayIndex === 0 ? 6 : dayIndex - 1;
    };

    const todayIndex = normalizeDayIndex(new Date().getDay());
    const selectedIndex = selectedDay === "Sun" ? 6 : dayIndexMap[selectedDay];

    const handleSelectDay = (day) => {
        setSelectedDay(day);
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            const currentDayIndex = normalizeDayIndex(newDate.getDay());
            const targetDayIndex = dayIndexMap[day];
            const diff = targetDayIndex - currentDayIndex;
            newDate.setDate(newDate.getDate() + diff);
            return newDate;
        });
    };

    // =====================================================================
    // ======== chức năng điều hướng tuần ================================
    // =====================================================================
    const handleChangeWeek = (step) => {
        setCurrentDate((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() + step * 7);
            return d;
        });
    };

    return (
        <div className="space-y-6 pt-6">
            <div className="text-center sm:text-left mb-8">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    Kế hoạch <span className="text-gradient-brand">Dinh Dưỡng</span>
                </h1>
                <p className="text-slate-400 mt-2 text-sm sm:text-base">Kiểm soát lượng calo mỗi ngày để đạt mục tiêu vóc dáng.</p>
            </div>

            <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
                {/* Decoration background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                {/* WEEK NAV */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => handleChangeWeek(-1)}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer text-slate-300"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-white">
                            {dateDetail.weekRangeFull}
                        </div>
                        <div className="text-sm text-brand-light font-medium mt-1">
                            {dateDetail.currentDateFull}
                        </div>
                    </div>

                    <button
                        onClick={() => handleChangeWeek(1)}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer text-slate-300"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* ===== WEEK CALORIES ===== */}
                <div className="glass-card p-6 rounded-2xl mb-10 border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
                            <Flame className="text-orange-400 w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-white font-semibold text-lg">Tổng Năng Lượng Tuần</div>
                            <div className="text-xs text-slate-400 mt-0.5">Cộng dồn từ tất cả bữa ăn</div>
                        </div>
                    </div>
                                    
                    <div className="flex-1 w-full sm:max-w-xs">
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                            {typeof totalWeekCalories === "number" ? totalWeekCalories : 0} <span className="text-sm font-normal text-slate-400">kcal</span>
                            </div>
                            <div className="text-xs text-brand-light font-medium flex items-center gap-1">
                                <Target size={12} /> 72%
                            </div>
                        </div>
                        {/* progress mock */}
                        <div className="h-2.5 rounded-full bg-black/40 overflow-hidden shadow-inner">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-brand shadow-[0_0_10px_rgba(232,93,74,0.5)]"
                                style={{ width: "72%" }}
                            />
                        </div>
                        <div className="text-right text-xs text-slate-500 mt-2">
                            Mục tiêu: 17,500 kcal
                        </div>
                    </div>
                </div>

                {/* DAY TIMELINE */}
                <div className="relative mt-4">
                    {/* đường nền */}
                    <div className="absolute left-0 right-0 top-[40px] h-[2px] bg-white/5 rounded-full" />
                    
                    {/* đường active */}
                    <div
                        className="absolute top-[40px] left-0 h-[2px] bg-gradient-to-r from-brand-light to-brand transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(232,93,74,0.6)]"
                        style={{ width: `${(selectedIndex / 6) * 100}%` }}
                    />
                    
                    <div className="grid grid-cols-7 gap-2 sm:gap-4 relative z-10">
                        {days.map((day, index) => {
                            const weekDate = dateDetail.weekDates[index];
                            const isSelected = selectedIndex === index;
                            const isToday = todayIndex === index;
                        
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleSelectDay(day)}
                                    className={`flex flex-col items-center py-2 sm:py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                                        isSelected
                                            ? "bg-white/10 shadow-lg scale-105 border border-white/10"
                                            : "hover:bg-white/5 hover:-translate-y-1"
                                    }`}
                                >
                                    {/* thứ */}
                                    <span className={`text-xs font-medium mb-3 ${isSelected ? "text-brand-light" : "text-slate-400"}`}>
                                        {labels[index]}
                                    </span>
                                        
                                    {/* chấm timeline */}
                                    <div
                                        className={`rounded-full transition-all duration-300 z-10 ${
                                            isSelected
                                                ? "w-4 h-4 bg-brand shadow-[0_0_12px_rgba(232,93,74,0.8)] ring-4 ring-black/50"
                                                : isToday
                                                ? "w-3 h-3 bg-amber-400 ring-4 ring-amber-400/20"
                                                : "w-2.5 h-2.5 bg-slate-600"
                                        }`}
                                    />

                                    {/* ngày */}
                                    <span className={`text-sm sm:text-base font-semibold mt-3 ${isSelected ? "text-white" : "text-slate-300"}`}>
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