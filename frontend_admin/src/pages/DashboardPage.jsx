import { useState } from "react";
import { mockAnalytics } from "../data/mockData";
import { 
  DollarSign, 
  Users, 
  Crown, 
  Bot, 
  TrendingUp, 
  ArrowUpRight, 
  Cpu,
  Activity
} from "lucide-react";

export function DashboardPage() {
  const [data] = useState(mockAnalytics);

  const stats = [
    {
      title: "Tổng Doanh Thu",
      value: `${data.totalRevenue.toLocaleString("vi-VN")} đ`,
      sub: `+${(data.revenueThisMonth).toLocaleString("vi-VN")} đ tháng này`,
      icon: DollarSign,
      color: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
    },
    {
      title: "Tổng Người Dùng",
      value: data.activeUsers.toLocaleString("vi-VN"),
      sub: `${data.proUsersCount} tài khoản Pro (${Math.round((data.proUsersCount / data.activeUsers) * 100)}%)`,
      icon: Users,
      color: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30",
    },
    {
      title: "Yêu Cầu AI Health",
      value: data.totalAiRequests.toLocaleString("vi-VN"),
      sub: "Request qua Node Query Rewriter",
      icon: Bot,
      color: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30",
    },
    {
      title: "Chi Phí LLM Token",
      value: `$${data.aiCostsUSD}`,
      sub: "~365.000 đ chi phí API",
      icon: Cpu,
      color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          Tổng quan Hệ thống Smart-Recipe
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Báo cáo doanh thu, tăng trưởng người dùng và thống kê chi phí hạ tầng AI.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} border backdrop-blur-md relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-2">{stat.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHART & PRO SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu 5 tháng gần nhất */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Tăng trưởng Doanh thu (5 Tháng gần nhất)
            </h3>
            <span className="text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              Đơn vị: VNĐ
            </span>
          </div>

          <div className="space-y-3 mt-6">
            {data.monthlyRevenueChart.map((item, idx) => {
              const maxRev = 6000000;
              const percentage = Math.min(100, Math.round((item.revenue / maxRev) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.month}</span>
                    <span className="text-amber-400 font-bold">
                      {item.revenue.toLocaleString("vi-VN")} đ ({item.users} users)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thông tin Gói dịch vụ */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
              <Crown className="w-4 h-4" />
              <span>Gói nâng cấp Smart-Recipe PRO</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Thành viên Pro có quyền truy cập không giới hạn tính năng **AI Health Assessment**, mở khóa toàn bộ lộ trình ăn uống cá nhân hóa và bài tập nâng cao.
            </p>

            <div className="mt-4 space-y-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-300">Gói 1 Tháng</span>
                <span className="font-bold text-white">59.000 đ</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-300">Gói 3 Tháng</span>
                <span className="font-bold text-white">149.000 đ</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center text-xs">
                <span className="text-amber-300 font-bold">Gói 1 Năm (Khuyên dùng)</span>
                <span className="font-bold text-amber-400">399.000 đ</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert("Mở modal cấu hình bảng giá SaaS")}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Cấu hình Giá gói PRO</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}