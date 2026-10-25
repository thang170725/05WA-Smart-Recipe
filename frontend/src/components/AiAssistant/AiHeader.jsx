// Phần tiêu đề (Header, trạng thái online/đang chờ)
import { Sparkles } from "lucide-react";

export function AiHeader({ isInterrupted }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-slate-900 text-white">
      <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-brand-light" />
      </div>
      <div>
        <h2 className="text-sm font-semibold font-display">Trợ lý AI</h2>
        <p className={`text-xs ${isInterrupted ? "text-yellow-400" : "text-emerald-400"}`}>
          {isInterrupted ? "● Đang chờ phản hồi của bạn" : "● Trực tuyến"}
        </p>
      </div>
    </div>
  );
}