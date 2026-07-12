import { useState, useEffect } from "react";
import { GetUserInforApi } from "../api/UserInforApi";
import { motion } from "framer-motion";
import { Activity, Flame, Scale, Target } from "lucide-react"; // Thêm icon cho sinh động

// ===== USER PROFILE =====
const UserProfile = ({ user }) => (
  <div className="glass-card p-6 h-full border border-white/10 bg-white/5 rounded-3xl backdrop-blur-xl">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
        {user.fullname?.charAt(0) || "U"}
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-white">{user.fullname || "Người dùng"}</h2>
        <p className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
          {user.health_status || "Active"}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="space-y-1">
        <p className="text-gray-500 text-xs uppercase tracking-wider">Chiều cao</p>
        <p className="text-gray-200 font-medium">{user.height || "--"} cm</p>
      </div>
      <div className="space-y-1">
        <p className="text-gray-500 text-xs uppercase tracking-wider">Cân nặng</p>
        <p className="text-gray-200 font-medium">{user.weight || "--"} kg</p>
      </div>
      <div className="space-y-1">
        <p className="text-gray-500 text-xs uppercase tracking-wider">Mục tiêu</p>
        <p className="text-gray-200 font-medium capitalize">{user.target_goal || "--"}</p>
      </div>
      <div className="space-y-1">
        <p className="text-gray-500 text-xs uppercase tracking-wider">Vận động</p>
        <p className="text-gray-200 font-medium capitalize">{user.activity_level || "--"}</p>
      </div>
    </div>
  </div>
);

// ===== STATS GRID (Thay thế Radar Chart) =====
const StatsGrid = ({ user }) => {
  const stats = [
    { label: "Chỉ số BMI", value: user.bmi, suffix: "", icon: <Scale size={18} />, color: "text-sky-400", bg: "bg-sky-400/10" },
    { label: "BMR (Nghỉ ngơi)", value: user.bmr, suffix: " kcal", icon: <Activity size={18} />, color: "text-violet-400", bg: "bg-violet-400/10" },
    { label: "TDEE (Tiêu hao)", value: user.tdee, suffix: " kcal", icon: <Flame size={18} />, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Mục tiêu", value: user.target_goal, suffix: "", icon: <Target size={18} />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {stat.value || "--"}
            <span className="text-sm font-normal text-gray-500">{stat.suffix}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ===== MAIN =====
export function UserInfor({ devMode }) {
  const [userInfor, setUserInfor] = useState({});

  useEffect(() => {
    const loadApi = async () => {
      const response = await GetUserInforApi();
      if (response) setUserInfor(response);
    };
    loadApi();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      <div className="lg:col-span-4">
        <UserProfile user={userInfor} />
      </div>
      <div className="lg:col-span-8">
        <StatsGrid user={userInfor} />
      </div>
    </div>
  );
}