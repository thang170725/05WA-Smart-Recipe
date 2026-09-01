import { useState } from "react";
import { initialUsers } from "../data/mockData";
import { Users, Crown, ShieldAlert, CheckCircle, Ban } from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = useState(initialUsers);

  const toggleBan = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "BANNED" ? "ACTIVE" : "BANNED" } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          Quản lý Tài khoản Người dùng
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Xem thông tin chỉ số sinh học, trạng thái gói PRO và quản lý quyền truy cập tài khoản.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">User ID</th>
                <th className="p-4">Họ và tên / Email</th>
                <th className="p-4">Chỉ số Sinh học</th>
                <th className="p-4">Phân quyền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="p-4 font-mono text-slate-400">{u.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div>{u.height}cm | {u.weight}kg</div>
                    <div className="text-[10px] text-amber-400 font-medium">Mục tiêu: {u.goal}</div>
                  </td>
                  <td className="p-4">
                    {u.role === "PRO" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Crown className="w-3 h-3" /> PRO
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {u.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5" /> Bị khóa
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleBan(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        u.status === "BANNED"
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      }`}
                    >
                      {u.status === "BANNED" ? "Mở khóa" : "Khóa TK"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}