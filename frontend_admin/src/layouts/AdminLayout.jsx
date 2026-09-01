import { Link, NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bot, 
  ChefHat, 
  LogOut, 
  ShieldCheck,
  Bell
} from "lucide-react";

export function AdminLayout() {
  const menuItems = [
    { path: "/dashboard", label: "Tổng quan Analytics", icon: LayoutDashboard },
    { path: "/users", label: "Quản lý Người dùng", icon: Users },
    { path: "/transactions", label: "Duyệt Gói Pro / Nạp tiền", icon: CreditCard },
    { path: "/recipes", label: "Kho Công thức & Bài tập", icon: ChefHat },
    { path: "/ai-config", label: "Cấu hình AI & Prompt", icon: Bot },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col fixed inset-y-0 z-30">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white leading-none">Smart-Recipe</h1>
            <span className="text-[11px] font-semibold text-amber-400 tracking-wider">ADMIN PANEL</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => alert("Đã đăng xuất khỏi tài khoản Admin")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        {/* HEADER TOP BAR */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-medium">Hệ thống đang chạy ổn định (Port 5174)</span>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-xs">
                AD
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Lê Đức Thắng</div>
                <div className="text-[10px] text-slate-400">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* ROUTE PAGE CONTENT */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}