import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Activity, Flame, BrainCircuit, AlertCircle } from "lucide-react";

export default function HealthCenter() {
  const mockData = {
  user: {
    fullname: "Lê Đức Thắng",
    height: 170,
    weight: 75,
    activity_level: "moderate",
  },
  metrics: {
    bmi: 25.9,
    healthStatus: "Thừa cân nhẹ",
    tdee: 2450,
    targetCalories: 2100,
    bmr: 1680,
  },
  weight_history: [
    { day: "Mon", weight: 76 },
    { day: "Tue", weight: 75.8 },
    { day: "Wed", weight: 75.5 },
    { day: "Thu", weight: 75.3 },
    { day: "Fri", weight: 75.1 },
    { day: "Sat", weight: 74.9 },
    { day: "Sun", weight: 74.7 },
  ],
};

const [data, setData] = useState(mockData);

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       // 👉 Thay bằng API thật của bạn
  //       const res = await fetch("/api/health-profile");
  //       const json = await res.json();
  //       setData(json);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  //   fetchData();
  // }, []);

  // if (!data) {
  //   return (
  //     <div className="min-h-screen bg-black flex items-center justify-center text-white">
  //       Đang tải dữ liệu sức khỏe...
  //     </div>
  //   );
  // }

  const { user, metrics, weight_history } = data;

  return (
    <section
      className="w-full relative text-white pb-10 mt-8"
    >
      {/* USER INFO */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl">
          <h3 className="font-semibold mb-4">
            Thông tin cấu hình
          </h3>
          <ul className="space-y-3 text-sm text-gray-200">
            <li className="flex justify-between">
              <span>Chiều cao</span>
              <span>{user.height} cm</span>
            </li>
            <li className="flex justify-between">
              <span>Cân nặng</span>
              <span>{user.weight} kg</span>
            </li>
            <li className="flex justify-between">
              <span>Mức vận động</span>
              <span className="capitalize">
                {user.activity_level}
              </span>
            </li>
          </ul>
        </div>

      <div className="relative z-10 mx-auto py-16 px-6 space-y-10">
        {/* METRIC CARDS */}
        <div className="grid md:grid-cols-2 gap-6">
          <MetricCard
            label="Cân nặng dự kiến sau 1 tuần"
            value={metrics.bmi}
            sub={metrics.healthStatus}
            alert={metrics.bmi > 25}
            icon={<Activity size={18} />}
          />

          <MetricCard
            label="Đánh giá mức độ cơ thể"
            value={metrics.bmi}
            sub={metrics.healthStatus}
            alert={metrics.bmi > 25}
            icon={<Activity size={18} />}
          />
        </div>

        {/* AI INSIGHT */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-r from-indigo-600/30 to-purple-600/30 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
          <div className="flex gap-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <BrainCircuit size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Đánh giá từ AI
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                Chào <b>{user.fullname}</b>, chỉ số BMI hiện tại của bạn là{" "}
                <b>{metrics.bmi}</b> ({metrics.healthStatus}).  
                Tổng năng lượng tiêu hao mỗi ngày (TDEE) ước tính{" "}
                <b>{metrics.tdee} kcal</b>.  
                Lượng calo mục tiêu đề xuất:{" "}
                <b>{metrics.targetCalories} kcal/ngày</b>.
              </p>
            </div>
          </div>
        </motion.div>

        

        {/* WEIGHT CHART */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
          <h3 className="mb-6 font-semibold">
            Biểu đồ cân nặng tuần
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weight_history}>
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  borderRadius: "12px",
                  border: "none",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================
   METRIC CARD COMPONENT
========================= */

function MetricCard({
  label,
  value,
  unit,
  sub,
  alert,
  highlight,
  icon,
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`p-6 rounded-3xl backdrop-blur-xl border border-white/10 shadow-xl relative ${
        highlight
          ? "bg-green-600/20 border-green-400/30"
          : "bg-white/10"
      }`}
    >
      <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm">
        {icon}
        {label}
      </div>

      <div className="text-3xl font-bold">
        {value} {unit}
      </div>

      <p
        className={`text-sm mt-1 ${
          alert ? "text-red-400 font-semibold" : "text-gray-400"
        }`}
      >
        {sub}
      </p>

      {alert && (
        <AlertCircle
          size={40}
          className="absolute top-4 right-4 text-red-500/20"
        />
      )}
    </motion.div>
  );
}