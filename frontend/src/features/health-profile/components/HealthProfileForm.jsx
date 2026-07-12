import { PostHealthFormApi } from "../api/HealthProfileApi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Scale, Activity, Sparkles, TrendingUp, ChevronDown, Award } from "lucide-react";
import { FormatDate, GetStartOfWeek } from "../../../components/Datetime";

export default function HealthProfileForm() {
  const devMode = "production";

  // ============================================================
  // ====== chức năng dự đoán cân nặng tuần tiếp theo =========
  // ============================================================
  const date = new Date();
  const weekStart = FormatDate(GetStartOfWeek(date));

  // ======= xử lý form ======
  const [form, setForm] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "male",
    activity_level: "sedentary",
    target_goal: "muscle", // Mặc định khớp với ảnh thiết kế
    week_start: weekStart
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ========= API ==========
  const [response, setResponse] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    const res = await PostHealthFormApi(devMode, form);
    setResponse(res);
    console.log(res);
  };

  // ====== format number cho đẹp ======
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "--";
    return Number(num).toLocaleString("vi-VN");
  };

  return (
    <section className="w-full min-h-screen text-zinc-100 p-6 sm:p-10 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      <div className="mx-auto relative z-10">
        {/* ================= HEADER CONTENT ================= */}
        <div className="mb-10">
          <span className="inline-block px-3 py-1 bg-orange-950/60 border border-orange-500/30 text-orange-400 font-mono font-bold text-[11px] rounded-full tracking-wider mb-3 uppercase">
            Kinetic Insights
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Trung tâm phân tích sức khỏe
          </h1>
          <p className="max-w-3xl text-zinc-400 text-sm sm:text-base leading-relaxed">
            Kiến tạo lộ trình tối ưu dựa trên dữ liệu cơ thể độc bản của bạn. Hệ thống Machine Learning của chúng tôi chuyển hóa các chỉ số thô thành chiến lược hành động cụ thể.
          </p>
        </div>

        {/* ================= MAIN LAYOUT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: INPUT FORM ================= */}
          <motion.form
            onSubmit={handleSend}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 bg-[#151929]/40 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <User size={20} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">Chỉ số đầu vào</h2>
            </div>

            <div className="space-y-4">
              {/* Chiều cao & Cân nặng */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Chiều cao (cm)</label>
                  <input
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    type="number"
                    placeholder="e.g. 175"
                    className="w-full bg-[#1b241f] border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none p-3 rounded-xl text-white text-sm transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Cân nặng (kg)</label>
                  <input
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    type="number"
                    placeholder="e.g. 70"
                    className="w-full bg-[#1b241f] border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none p-3 rounded-xl text-white text-sm transition"
                  />
                </div>
              </div>

              {/* Tuổi & Giới tính */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Tuổi</label>
                  <input
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    type="number"
                    placeholder="e.g. 25"
                    className="w-full bg-[#1b241f] border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none p-3 rounded-xl text-white text-sm transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Giới tính</label>
                  <div className="grid grid-cols-2 bg-[#1b241f] border border-zinc-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, gender: "male" })}
                      className={`py-2 text-xs font-bold rounded-lg transition ${form.gender === "male" ? "bg-[#10b981] text-neutral-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
                    >
                      Nam
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, gender: "female" })}
                      className={`py-2 text-xs font-bold rounded-lg transition ${form.gender === "female" ? "bg-[#10b981] text-neutral-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
                    >
                      Nữ
                    </button>
                  </div>
                </div>
              </div>

              {/* Tần suất vận động */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Tần suất vận động</label>
                <div className="relative">
                  <select
                    name="activity_level"
                    value={form.activity_level}
                    onChange={handleChange}
                    className="w-full bg-[#1b241f] border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none p-3 rounded-xl text-white text-sm appearance-none pr-10 transition cursor-pointer"
                  >
                    <option value="sedentary">Không vận động (Văn phòng)</option>
                    <option value="light">Vận động nhẹ (1-3 ngày/tuần)</option>
                    <option value="moderate">Vận động vừa (3-5 ngày/tuần)</option>
                    <option value="active">Vận động nặng (6-7 ngày/tuần)</option>
                    <option value="very_active">Vận động rất nặng (Vận động viên)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Mục tiêu cá nhân */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Mục tiêu cá nhân</label>
                <div className="relative">
                  <select
                    name="target_goal"
                    value={form.target_goal}
                    onChange={handleChange}
                    className="w-full bg-[#1b241f] border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none p-3 rounded-xl text-white text-sm appearance-none pr-10 transition cursor-pointer"
                  >
                    <option value="muscle">Tăng cơ & Sức mạnh</option>
                    <option value="lose">Giảm mỡ & Siết cơ</option>
                    <option value="gain">Tăng cân lành mạnh</option>
                    <option value="balance">Duy trì thể trạng cân bằng</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16,185,129,0.2)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#10b981] hover:bg-[#12cb8e] text-neutral-950 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition"
            >
              <Sparkles size={16} fill="currentColor" /> Phân tích bằng AI
            </motion.button>
          </motion.form>

          {/* ================= RIGHT COLUMN: DASHBOARD METRICS ================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/40 pb-3">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Activity size={18} />
                </span>
                Dự đoán Machine Learning
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase animate-pulse">
                Real-Time Processing...
              </span>
            </div>

            {/* Row 1: 4 Core Core AI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <HealthMetricCard 
                label="BMI" 
                value={formatNumber(response?.bmi ?? "22.5")} 
                badge="Normal" 
                badgeStyle="border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              />
              <HealthMetricCard 
                label="BMR" 
                value={formatNumber(response?.bmr ?? "1680")} 
                badge="Estimated" 
                badgeStyle="border-zinc-700 text-zinc-400 bg-zinc-800/30"
              />
              <HealthMetricCard 
                label="Body Fat" 
                value={formatNumber(response?.body_fat ?? "14.2")} 
                suffix="%" 
                badge="Athletic" 
                badgeStyle="border-orange-500/30 text-orange-400 bg-orange-500/10"
                className="border-orange-500/20 shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]"
              />
              <HealthMetricCard 
                label="TDEE" 
                value={formatNumber(response?.tdee ?? "2450")} 
                badge="Daily" 
                badgeStyle="border-zinc-700 text-zinc-400 bg-zinc-800/30"
              />
            </div>

            {/* Row 2: Two Medium-sized Cards (Calories Targets) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Total meal calories */}
              <div className="bg-[#141b17]/40 border border-zinc-800/50 p-6 rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-bold tracking-wider text-emerald-500 uppercase block mb-1">Goal Alignment</span>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Tổng calories nạp vào</h3>
                <div className="text-3xl font-black text-white flex items-baseline gap-1.5 mb-3">
                  {formatNumber(response?.total_meal_calories ?? "2850")}
                  <span className="text-xs font-normal text-zinc-500">kcal / ngày</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                  Dựa trên mục tiêu <span className="text-emerald-400 font-semibold">Tăng cơ</span>, bạn cần thặng dư khoảng 400 calories so với mức TDEE cơ bản của cơ thể.
                </p>
              </div>

              {/* Box 2: Exercise burned calories */}
              <div className="bg-[#141b17]/40 border border-zinc-800/50 p-6 rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase block mb-1">Intensity Target</span>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Năng lượng tiêu thụ mục tiêu</h3>
                <div className="text-3xl font-black text-white flex items-baseline gap-1.5 mb-3">
                  {formatNumber(response?.total_exercise_burned ?? "650")}
                  <span className="text-xs font-normal text-zinc-500">kcal / buổi tập</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                  Để tối ưu hóa trao đổi chất, các buổi tập <span className="text-amber-400 font-semibold">HIIT hoặc Strength</span> cần đạt cường độ tiêu hao năng lượng này.
                </p>
              </div>
            </div>

            {/* Row 3: Deep Predictive Large Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Balance Assessment Card */}
              <div className="bg-[#141b17]/60 border border-zinc-800/60 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">Dự đoán mức độ cân bằng cơ thể</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Hệ thống AI phân tích tỉ lệ cơ/mỡ tại 5 điểm trung tâm. Kết quả cho thấy xu hướng cân bằng{" "}
                      <span className="text-emerald-400 font-bold">{response?.label_bmi ?? "85/100"}</span>, phù hợp cho giai đoạn chuyển tiếp vận động mạnh.
                    </p>
                  </div>
                </div>
                <button type="button" className="w-full py-2.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20 text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider transition">
                  Xem biểu đồ chi tiết
                </button>
              </div>

              {/* Weight Prediction Card */}
              <div className="bg-[#141b17]/60 border border-zinc-800/60 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Cân nặng dự đoán tuần tới</h3>
                    <div className="text-3xl font-black text-white flex items-center gap-2 my-2">
                      {formatNumber(response?.predicted_weight_next_week ?? "71.2")}
                      <TrendingUp size={20} className="text-orange-400" />
                      <span className="text-sm font-normal text-zinc-500">kg</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Dựa trên cường độ tập luyện hiện tại và thực đơn dinh dưỡng đã đăng ký. Bạn đang đi đúng lộ trình tăng <span className="text-orange-400 font-bold">1.2kg</span> khối lượng cơ nạc.
                    </p>
                  </div>
                </div>
                <button type="button" className="w-full py-2.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20 text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider transition">
                  Chỉnh sửa thực đơn
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Sub-Component: Metric Card ---------- */
function HealthMetricCard({ label, value, suffix = "", badge, badgeStyle, className }) {
  return (
    <div className={`bg-[#141b17]/50 border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-zinc-700/80 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">{label}</span>
        {badge && (
          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide border ${badgeStyle}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-0.5">
        {value}
        {suffix && <span className="text-sm font-normal text-zinc-500 ml-0.5">{suffix}</span>}
      </div>
    </div>
  );
}