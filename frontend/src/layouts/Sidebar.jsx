import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Home, UtensilsCrossed, HeartPulse, BarChart3, MessagesSquare, ChevronDown } from "lucide-react";
import vietnamFlag from "../assets/vietnam_flag.png";
import logo from "../assets/logo2.png"

export function Sidebar() {
  const [openHealth, setOpenHealth] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-item nav-item-active" : "nav-item";

  const subLinkClass = ({ isActive }) =>
    isActive
      ? "block px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 border-l-2 border-brand"
      : "block px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors";

  return (
    <aside className="fixed left-0 top-0 z-30 hidden lg:flex flex-col w-[260px] h-screen glass-panel rounded-none border-l-0 border-t-0 border-b-0 border-r border-white/10">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <h1 className="font-display text-xl font-bold text-white tracking-tight">
          Smart <span className="text-brand-light">Recipe</span>
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <img src={vietnamFlag} className="w-4 h-4 rounded-sm object-cover" alt="" />
          <img className="w-4 h-4 rounded-sm object-cover" src={logo} alt="" />
          <span className="text-[11px] text-slate-400 font-medium">by Le Duc Thang</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
        <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu chính
        </p>
        <ul className="space-y-1">
          <li>
            <NavLink to="/" end className={navLinkClass}>
              <Home size={18} className="shrink-0 opacity-80" />
              Trang chủ
            </NavLink>
          </li>

          <li>
            <NavLink to="/meals" end className={navLinkClass}>
              <UtensilsCrossed size={18} className="shrink-0 opacity-80" />
              Thực đơn
            </NavLink>
          </li>

          <li>
            <button
              onClick={() => setOpenHealth(!openHealth)}
              className="nav-item w-full cursor-pointer"
            >
              <HeartPulse size={18} className="shrink-0 opacity-80" />
              <span className="flex-1 text-left">Sức khỏe</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${openHealth ? "rotate-180" : ""}`}
              />
            </button>

            {openHealth && (
              <ul className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
                <li>
                  <NavLink to="/health-center" className={subLinkClass}>
                    Trung tâm sức khỏe
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/workout-roadmap" className={subLinkClass}>
                    Lộ trình luyện tập
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          <li>
            <NavLink to="/dashboard" end className={navLinkClass}>
              <BarChart3 size={18} className="shrink-0 opacity-80" />
              Thống kê
            </NavLink>
          </li>

          <li>
            <NavLink to="/platform" end className={navLinkClass}>
              <MessagesSquare size={18} className="shrink-0 opacity-80" />
              Diễn đàn
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer note */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Ăn thông minh · Tập khoa học
        </p>
      </div>
    </aside>
  );
}
