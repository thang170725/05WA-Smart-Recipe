import { useState } from "react";
import { initialTransactions } from "../data/mockData";
import { CreditCard, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";

export function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm xử lý Duyệt giao dịch
  const handleApprove = (id) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: "APPROVED" } : tx))
    );
  };

  // Hàm xử lý Từ chối giao dịch
  const handleReject = (id) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: "REJECTED" } : tx))
    );
  };

  const filteredTx = transactions.filter((tx) => {
    const matchesFilter = filter === "ALL" || tx.status === filter;
    const matchesSearch =
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transferCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Duyệt Gói Pro & Thanh Toán Chuyển Khoản
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Xác nhận mã giao dịch chuyển khoản VietQR / MoMo từ người dùng để nâng cấp tài khoản Pro.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên user, mã chuyển khoản..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === st
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL" && "Tất cả"}
              {st === "PENDING" && "Chờ duyệt"}
              {st === "APPROVED" && "Đã duyệt"}
              {st === "REJECTED" && "Từ chối"}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Mã GD</th>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Gói nâng cấp</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4">Nội dung CK</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    Không tìm thấy giao dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="p-4 font-mono text-slate-400 font-semibold">{tx.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{tx.userName}</div>
                      <div className="text-[10px] text-slate-500">{tx.userEmail}</div>
                    </td>
                    <td className="p-4 font-medium text-amber-300">{tx.planName}</td>
                    <td className="p-4 font-bold text-white">
                      {tx.amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800">
                        {tx.transferCode}
                      </span>
                    </td>
                    <td className="p-4">
                      {tx.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}
                      {tx.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Đã nâng PRO
                        </span>
                      )}
                      {tx.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" /> Từ chối
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {tx.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(tx.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all"
                          >
                            Duyệt PRO
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(tx.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-[11px] transition-all"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Đã hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}