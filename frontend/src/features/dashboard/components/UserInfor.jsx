import { useState, useEffect } from "react";
import { GetUserInforApi } from "../api/UserInforApi";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ===== USER PROFILE =====
const UserProfile = ({ user }) => (
  <div className="glass-card p-6 h-full">
    <h2 className="font-display text-base font-semibold text-white mb-4 pb-3 border-b border-white/10">Thông tin</h2>

    <div className="space-y-2 text-sm text-gray-300">
      <p><span className="text-gray-400">Name:</span> {user.fullname}</p>
      <p><span className="text-gray-400">Birth:</span> {user.birth_date}</p>
      <p><span className="text-gray-400">Height:</span> {user.height} cm</p>
      <p><span className="text-gray-400">Weight:</span> {user.weight} kg</p>
      <p><span className="text-gray-400">Goal:</span> {user.target_goal}</p>
      <p><span className="text-gray-400">Activity:</span> {user.activity_level}</p>
      <p><span className="text-gray-400">Health:</span> {user.health_status}</p>
    </div>
  </div>
);

// ===== CUSTOM LEGEND =====
const MetricsLegend = ({ user }) => (
  <div className="grid grid-cols-1 gap-3 text-sm -mt-6">
    <p className="text-gray-400 bg-white/5 p-3 rounded-xl">BMI: <span className="font-bold text-green-400">{user.bmi}</span></p>  
    <p className="text-gray-400 bg-white/5 p-3 rounded-xl">BMR: <span className="font-bold">{user.bmr}</span></p>
    <p className="text-gray-400 bg-white/5 p-3 rounded-xl">TDEE: <span className="font-bold">{user.tdee}</span></p>
    <p className="text-gray-400 bg-white/5 p-3 rounded-xl">Goal: <span className="font-bold">{user.target_goal}</span></p>    
  </div>
);

// ===== RADAR CHART =====
const BodyChart = ({ user }) => {
  const data = [
    { subject: "BMI", value: user.bmi || 0 },
    { subject: "BMR", value: (user.bmr || 0) / 100 },
    { subject: "TDEE", value: (user.tdee || 0) / 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 h-full"
    >
      <h2 className="font-display text-base font-semibold text-white mb-4 pb-3 border-b border-white/10">Chỉ số cơ thể</h2>

      <div className="flex">
        <div className="w-[80%] h-50">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <Tooltip />
              <Radar dataKey="value" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* legend hiển thị số */}
        <MetricsLegend user={user} />
      </div>

    </motion.div>
  );
};

// ===== MAIN =====
export function UserInfor({ devMode }) {
  const [userInfor, setUserInfor] = useState({ 
    fullname: "",
    birth_date: "",
    gender: "",
    activity_level: "",
    target_goal: "",
    weight: 0,
    height: 0,
    bmi: 0,
    bmr: 0,
    tdee: 0,
    health_status: ""
  });

  useEffect(() => {
    const loadApi = async () => {
      const response = await GetUserInforApi();
      if (response) {
        setUserInfor((prev) => ({
          ...prev,
          ...response
        }));
      }
    };

    loadApi();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      {/* LEFT */}
      <UserProfile user={userInfor} />

      {/* RIGHT */}
      <div className="md:col-span-3">
        <BodyChart user={userInfor} />
      </div>

    </div>
  );
}