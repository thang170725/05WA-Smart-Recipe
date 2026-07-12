import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MockDataDashboard } from "../mockdata/DashBoard";
import Header from "../features/dashboard/components/Header";
import { UserInfor } from "../features/dashboard/components/UserInfor";
import { GetHealthHistoryApi } from "../features/dashboard/api/HealthHistoryApi";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from "recharts";

const COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#a855f7"];

// Thêm Component bao bọc biểu đồ có chứa Text giải thích
const AnnotatedChartCard = ({ title, description, children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`p-6 sm:p-8 rounded-3xl border border-white bg-[#141b17]/10 backdrop-blur-xl ${className}`}
  >
    <div className="mb-6">
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
    <div className="w-full h-[280px]">
      {children}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const devMode = "dev";
  const [data, setData] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);

  useEffect(() => {
    const loadAPI = async () => {
      setData(MockDataDashboard());
      const history = await GetHealthHistoryApi(devMode);
      setHealthHistory(history);
    };
    loadAPI();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-emerald-400">
        <span className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          Đang đồng bộ dữ liệu...
        </span>
      </div>
    );
  }

  const { stats, muscle_distribution, calories_weekly, workout_weekly } = data;

  return (
    <section className="w-full min-h-screen text-white p-6 sm:p-10 font-sans">
      <div className="w-[90%] mx-auto space-y-8">
        {/* Header */}
        <Header />
        
        <UserInfor devMode={devMode} />

        {/* HÀNG 1: Biểu đồ trọng tâm (Full width) */}
        <AnnotatedChartCard
          title="Xu hướng thay đổi BMI"
          description="Đường cong thể hiện sự biến thiên chỉ số khối cơ thể (BMI) của bạn qua các tháng. Một biểu đồ đi ngang hoặc giảm nhẹ cho thấy bạn đang kiểm soát tốt cân nặng của mình theo thời gian thực."
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height="100%">
            {/* Đổi sang AreaChart cho đẹp và hiện đại hơn LineChart thường */}
            <AreaChart data={healthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="bmi_avarage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBmi)" />
            </AreaChart>
          </ResponsiveContainer>
        </AnnotatedChartCard>

        {/* HÀNG 2: Các biểu đồ phân tích chi tiết (Chia 2 cột) */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          
          <AnnotatedChartCard
            title="Năng lượng tiêu hao hàng tuần"
            description="Tổng lượng Calories bạn đã đốt cháy mỗi tuần thông qua việc tập luyện. Các cột nhô cao chứng tỏ tuần đó bạn đã hoạt động vô cùng năng suất."
            delay={0.3}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calories_weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#27272a', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Bar dataKey="calories" fill="#f97316" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </AnnotatedChartCard>

          <AnnotatedChartCard
            title="Tần suất buổi tập"
            description="Số lượng buổi tập hoàn thành trong tuần. Duy trì các cột ở mức ổn định là chìa khóa để xây dựng thói quen kỷ luật."
            delay={0.4}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workout_weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#27272a', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Bar dataKey="sessions" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </AnnotatedChartCard>

        </div>

        {/* HÀNG 3: Pie Chart đưa xuống cuối làm thông tin phụ trợ */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <AnnotatedChartCard
            title="Phân bổ rèn luyện nhóm cơ"
            description="Tỉ lệ phần trăm các nhóm cơ bạn đã tập luyện. Phân tích này giúp bạn điều chỉnh giáo án, tránh việc tập lệch quá nhiều vào một vùng cơ thể."
            delay={0.5}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={muscle_distribution} dataKey="value" innerRadius={70} outerRadius={100} stroke="none">
                  {muscle_distribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ color: '#a1a1aa', fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </AnnotatedChartCard>
        </div>

      </div>
    </section>
  );
}