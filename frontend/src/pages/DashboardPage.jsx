import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { MockDataDashboard } from "../mockdata/DashBoard";
import Header from "../features/dashboard/components/Header"
import { UserInfor } from "../features/dashboard/components/UserInfor";
import { GetHealthHistoryApi } from "../features/dashboard/api/HealthHistoryApi";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#a855f7"];

export default function Dashboard() {
  const devMode = "dev"

  // ======= CONSTANT =======
  const [data, setData] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]) // lịch sử trung bình chỉ số sức khỏe

  // ========= API ========
  useEffect(() => {

  const loadAPI = async () => {
    setData(MockDataDashboard())

    // API get health history
    const healthHistory = await GetHealthHistoryApi(devMode)
    setHealthHistory(healthHistory)
  }

  loadAPI();

}, []);


if (!data) {
  return (
    <div className="page-shell flex items-center justify-center text-slate-400">
      <span className="animate-pulse">Đang tải thống kê...</span>
    </div>
  );
}

const {
  stats,
  muscle_distribution,
  calories_weekly,
  workout_weekly
} = data;

  const activityData = [
    { name: "Meal Plans", value: stats.total_meal_plans },
    { name: "Workouts", value: stats.completed_workouts },
    { name: "Posts", value: stats.total_posts },
    { name: "Comments", value: stats.total_comments },
  ];

  return (
    <section className="page-shell text-white space-y-8">
      {/* HEADER */}
      <Header></Header>

      {/* Profile */}
      <UserInfor devMode={devMode}/>

      {/* CHART GRID */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* BMI TREND */}
        <GlassCard title="BMI History">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={healthHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bmi_avarage"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>


          {/* CALORIES */}

          <GlassCard title="Calories Burn Weekly">

            <ResponsiveContainer width="100%" height={280}>

              <BarChart data={calories_weekly}>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                <XAxis dataKey="week" stroke="#cbd5e1" />

                <YAxis stroke="#cbd5e1" />

                <Tooltip />

                <Bar dataKey="calories" fill="#f97316" />

              </BarChart>

            </ResponsiveContainer>

          </GlassCard>


          {/* WORKOUT */}

          <GlassCard title="Workout Sessions Weekly">

            <ResponsiveContainer width="100%" height={280}>

              <BarChart data={workout_weekly}>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                <XAxis dataKey="week" stroke="#cbd5e1" />

                <YAxis stroke="#cbd5e1" />

                <Tooltip />

                <Bar dataKey="sessions" fill="#0ea5e9" />

              </BarChart>

            </ResponsiveContainer>

          </GlassCard>


          {/* MUSCLE */}

          <GlassCard title="Muscle Distribution">

            <ResponsiveContainer width="100%" height={280}>

              <PieChart>

                <Pie
                  data={muscle_distribution}
                  dataKey="value"
                  outerRadius={100}
                >

                  {muscle_distribution.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}

                </Pie>

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </GlassCard>

        </div>

    </section>
  );
}


/* ===============================
   COMPONENTS
================================= */

const GlassCard = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 sm:p-8"
  >
    <h2 className="font-display text-base font-semibold text-white mb-5 pb-3 border-b border-white/10">
      {title}
    </h2>
    {children}
  </motion.div>
);