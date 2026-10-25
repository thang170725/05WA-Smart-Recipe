// Vùng nhập liệu (Textarea, nút Micro STT, nút Gửi)

import { Send, Mic } from "lucide-react";

export function AiInputBox({
  input,
  setInput,
  handleInput,
  handleKeyDown,
  handleSend,
  handleResume,
  startListening,
  isListening,
  loading,
  isInterrupted,
  textareaRef
}) {
  return (
    <div className="p-4 border-t bg-white">
      {/* Interrupted banner */}
      {isInterrupted && !loading && (
        <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700 flex items-center gap-1.5">
          <span>⏸</span>
          <span>Trợ lý đang chờ phản hồi của bạn ở trên. Hãy chọn một trong các lựa chọn hoặc gõ câu trả lời.</span>
        </div>
      )}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={
            isInterrupted
              ? "Hoặc gõ câu trả lời của bạn..."
              : "Hãy hỏi tôi bất kỳ thứ gì ..."
          }
          disabled={loading}
          className="flex-1 resize-none rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/30 max-h-45 overflow-y-auto disabled:opacity-50 custom-scroll text-black"
        />

        {/* Voice */}
        <button
          onClick={startListening}
          disabled={loading || isListening}
          title="Nhập bằng giọng nói"
          className={`p-3 rounded-2xl transition mb-2 shrink-0 ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Mic size={20} />
        </button>

        {/* Send */}
        <button
          onClick={() => {
            if (isInterrupted && input.trim()) {
              handleResume(input);
              setInput("");
            } else {
              handleSend();
            }
          }}
          disabled={loading}
          className="bg-brand text-white p-3 rounded-2xl hover:bg-brand-light transition disabled:opacity-50 mb-2"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}