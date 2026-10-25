// Vùng hiển thị tin nhắn (gồm cả bubble, suggestions, interrupt buttons)

import { Sparkles } from "lucide-react";
import WorkflowProgress from "../../../components/AiAssistant/WorkflowProgress";

export function AiMessageList({
  messages,
  workflow,
  loading,
  handleSend,
  handleResume,
  handleConfirm,
  handleCancel,
  messagesEndRef
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 space-y-4 bg-slate-50 custom-scroll text-black">
      {messages.map((msg, i) => {
        // SUGGESTIONS
        if (msg.type === "suggestions") {
          return (
            <div key={i} className="flex justify-start w-full mt-2 mb-4">
              <div className="w-full max-w-[95%]">
                <p className="text-sm text-slate-600 font-medium mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-brand" />
                  {msg.content}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {msg.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(`${opt.title}: ${opt.desc}`)}
                      disabled={loading}
                      className="flex items-start gap-3 p-3 text-left bg-white border border-slate-200 rounded-xl hover:border-brand hover:shadow-md hover:shadow-brand/10 transition-all duration-300 group disabled:opacity-50"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{opt.icon}</div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-brand transition-colors">{opt.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // CHAT BUBBLE
        return (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-5 py-3 max-w-[80%] break-words whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-brand text-white rounded-2xl rounded-br-md shadow-sm"
                  : "bg-white text-black rounded-2xl rounded-bl-md border border-slate-100 shadow-sm"
              }`}>
                {msg.content}
              </div>

              {/* Ask User interrupt quick-reply */}
              {msg.type === "ask_user" && Array.isArray(msg.options) && msg.options.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={loading}
                      onClick={() => handleResume(opt)}
                      className="px-3 py-1.5 rounded-lg border border-brand/40 bg-white text-sm text-brand hover:bg-brand hover:text-white transition-all duration-200 disabled:opacity-50"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Confirm interrupt buttons */}
              {msg.type === "confirm_interrupt" && (
                <div className={`mt-2 flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <button
                    onClick={() => handleResume("Xác nhận")}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    ✅ Xác nhận
                  </button>
                  <button
                    onClick={() => handleResume("Hủy")}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {/* Backward-compat: PENDING_ACTIONS confirm */}
              {msg.type === "confirm" && (
                <div className={`mt-2 flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Workflow progress */}
      {loading && workflow.length > 0 && (
        <div className="flex justify-start">
          <div className="w-full max-w-[92%]">
            <WorkflowProgress workflow={workflow} />
          </div>
        </div>
      )}
      {loading && workflow.length === 0 && (
        <div className="flex justify-start">
          <div className="text-xs text-gray-500 animate-pulse px-2">AI đang kết nối...</div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}