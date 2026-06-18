import { PostHealthFormApi } from "../api/HealthProfileApi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Scale, Activity, Sparkles } from "lucide-react";

export default function HealthProfileForm() {
  const devMode = "dev"

  // ====== TEST ======
  // useEffect(() => {
  //   console.log("Month: ", month)
  // }, [])

  // ====== tính toán thánh ======
  const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const date = new Date()
  const month_str = monthList[date.getMonth()]
  const month_number = date.getMonth() + 1

  // ======= xử lý form ======
  const [form, setForm] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "male",
    activity_level: "sedentary",
    target_goal: "",
    month_str: month_str,
    month_number: month_number
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ========= API ==========
  // API POST FORM INFOR USER ABOUT HEALTH
  const [response, setResponse] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();

    const res = await PostHealthFormApi(devMode, form)
    setResponse(res)
    console.log(res)
  };

  // ====== format number cho đẹp ======
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "--";
    return Number(num).toLocaleString("vi-VN");
  };

  return (
    <section className="w-full">        
      <div className="h-auto flex items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col xl:flex-row items-stretch justify-center gap-8 py-8"
        >
          {/* ================= LEFT - FORM ================= */}
          <motion.form
            onSubmit={handleSend}
            className="w-full max-w-md xl:max-w-lg glass-card-elevated p-8 sm:p-10 text-white space-y-6"
          >
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <User /> Phân tích sức khỏe hiện tại
            </h2>

            <div className="grid grid-cols-10 gap-4">
              <input
                name="height"
                value={form.height}
                onChange={handleChange}
                type="number"
                placeholder="Chiều cao (cm)"
                className="input-glass col-span-4"
              />
              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                type="number"
                placeholder="Cân nặng hiện tại (kg)"
                className="input-glass col-span-6"
              />
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                type="number"
                placeholder="Tuổi"
                className="input-glass col-span-5"
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-glass col-span-5"
              >
                <option value="male" className="text-sky-950">Nam</option>
                <option value="female" className="text-sky-950">Nữ</option>
              </select>

              <select
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                className="input-glass col-span-8"
              >
                <option value="sedentary" className="text-sky-950">Không vận động</option>
                <option value="light" className="text-sky-950">Nhẹ</option>
                <option value="moderate" className="text-sky-950">Vừa</option>
                <option value="active" className="text-sky-950">Nặng</option>
                <option value="very_active" className="text-sky-950">Rất nặng</option>
              </select>

              {/* FIX BUG month */}
              <input 
                type="text" 
                disabled 
                name="month" 
                value={form.month_str}
                className="input-glass col-span-2 opacity-70"
              />

              {/* FIX BUG target_goal */}
              <select
                name="target_goal"
                value={form.target_goal}
                onChange={handleChange}
                className="input-glass col-span-10"
              >
                <option value="gain" className="text-sky-950">Tăng cân</option>
                <option value="lose" className="text-sky-950">Giảm cân</option>
                <option value="muscle" className="text-sky-950">Tăng cơ</option>
                <option value="balance" className="text-sky-950">Cân bằng</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 transition font-semibold flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />Phân tích bằng AI
            </motion.button>
          </motion.form>

        {/* ================= RIGHT - DASHBOARD ================= */}
        <div className="w-200 min-h-80 bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl text-white space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity /> Phân tích AI bằng Machine Learning
          </h2>

          <div className="grid grid-cols-4 gap-6">
            <HealthCard label="BMI" value={formatNumber(response?.bmi)} />
            <HealthCard label="BMR" value={formatNumber(response?.bmr)} />
            <HealthCard label="Body Fat" value={formatNumber(response?.body_fat)} suffix="%" />
            <HealthCard label="TDEE" value={formatNumber(response?.tdee)} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <HealthCard 
              label="Tổng calories nạp vào" 
              value={formatNumber(response?.total_meal_calories)} 
            />
            <HealthCard 
              label="Tổng lượng calories đốt cháy khi luyện tập" 
              value={formatNumber(response?.total_exercise_burned)} 
            />
          </div>

          {/* BONUS: predicted weight */}
          <div className="grid grid-cols-1">
            <HealthCard 
              label="Cân nặng dự đoán tháng tới tới" 
              value={formatNumber(response?.predicted_weight_next_week)} 
              suffix=" kg"
            />
          </div>
        </div>
      </motion.div>

      {/* Tailwind custom style */}
      <style>
        {`
        .input-glass {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 0.75rem;
          border-radius: 1rem;
          outline: none;
          transition: 0.3s;
          color: white;
        }
        .input-glass:focus {
          border: 1px solid #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.3);
        }
      `}
      </style>
      </div>
    </section>
  );
}

/* ---------- Card Component ---------- */

function HealthCard({ label, value, suffix = "", className }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`bg-white/20 backdrop-blur-lg p-6 rounded-2xl text-center shadow-lg ${className}`}
    >
      <p className="opacity-70">{label}</p>
      <span className="font-bold">
        {value ?? "--"}
        {suffix}
      </span>
    </motion.div>
  );
}