import { useEffect, useRef, useState } from "react";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Avatar({
  user = {
    username: "guest",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  onLogout = () => {},
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
      >
        <img
          src={user.avatar}
          alt="avatar"
          className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
        />
        <ChevronDown
          size={16}
          className={`text-slate-300 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-dropdown z-50 overflow-hidden">
          <div className="py-1.5">
            <DropdownItem
              icon={User}
              label="My Profile"
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={Settings}
              label="Settings"
              onClick={() => {
                navigate("/settings");
                setOpen(false);
              }}
            />
          </div>

          <div className="border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <Icon
        size={18}
        className="text-slate-400 group-hover:text-brand transition-colors"
      />
      <span className="font-medium group-hover:text-slate-900">{label}</span>
    </button>
  );
}
