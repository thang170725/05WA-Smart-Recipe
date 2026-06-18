import { Sparkles, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AiAssistantApi, ConfirmAiActionApi } from "../api/AIAssistantApi";

export default function AiAssistant({ devMode }) {
  // ==== USESTATE  ====
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Xin chào! Tôi là trợ lý AI của Smart ReCipe và là trợ lý din dưỡng toàn năng của bạn. Đừng ngần ngại hỏi tôi",
    },
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* ================= Auto Scroll ================= */
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  /* ================= Auto Resize Textarea ================= */
  const handleInput = (e) => {
    setInput(e.target.value);

    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  /* ================= Send Message ================= */
  const [input, setInput] = useState(""); // user prompt section
  const [pendingAction, setPendingAction] = useState(null); // user confirm action

  // ======= API send prompt to server =========
  const handleSend = async (text) => {
    const message = text || input; // phần nội dung prompt của user (content)

    if (!message.trim() || loading) return;

    // ===== chặn gửi prompt mới khi đang chờ xác nhận =====
    if (pendingAction) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Bạn đang có một thao tác chờ xác nhận. Vui lòng xác nhận hoặc hủy trước khi tiếp tục.",
        },
      ]);

      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: message }]);

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);

    try {
      const res = await AiAssistantApi(devMode, { prompt: message });

      // ===== tránh crash nếu res undefined =====
      if (!res) return;

      if (res.status === "WAIT_CONFIRM") {
        setPendingAction(res.action_id);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.message,
            type: "confirm",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.reply || "Không có phản hồi.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Enter to Send ================= */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============= BUTTON CONFIRM ACTION ===========
  const handleConfirm = async () => {
    if (!pendingAction) return;

    setLoading(true);

    try {
      const res = await ConfirmAiActionApi(
        devMode,
        pendingAction
      );

      // ===== ẩn nút confirm của message cũ =====
      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === "confirm"
            ? { ...msg, type: "confirmed" }
            : msg
        )
      );

      if (res) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.reply,
          },
        ]);
      }

      setPendingAction(null);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Xác nhận thất bại. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // ===== ẩn nút confirm của message cũ =====
    setMessages((prev) =>
      prev.map((msg) =>
        msg.type === "confirm"
          ? { ...msg, type: "cancelled" }
          : msg
      )
    );

    setPendingAction(null);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Đã hủy thao tác.",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">

      {/* ================= Header ================= */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-slate-900 text-white">
        <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-brand-light" />
        </div>

        <div>
          <h2 className="text-sm font-semibold font-display">
            Trợ lý AI
          </h2>

          <p className="text-xs text-emerald-400">
            ● Trực tuyến
          </p>
        </div>
      </div>

            {/* ================= Messages ================= */}
      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-5
          py-6
          space-y-4
          bg-slate-50
          custom-scroll
          text-black
        "
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`
                flex
                flex-col
                ${
                  msg.role === "user"
                    ? "items-end"
                    : "items-start"
                }
              `}
            >
              <div
                className={`
                  px-5
                  py-3
                  max-w-[80%]
                  break-words
                  ${
                    msg.role === "user"
                      ? `
                        bg-brand
                        text-white
                        rounded-2xl
                        rounded-br-md
                      `
                      : `
                        glass-card
                        text-black
                        rounded-2xl
                        rounded-bl-md
                      `
                  }
                `}
              >
                {msg.content}
              </div>

              {msg.type === "confirm" && (
                <div
                  className={`
                    mt-2
                    flex
                    gap-2
                    ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >
                  <button
                    onClick={() => handleConfirm()}
                    className="px-3 py-2 rounded bg-green-600 text-black"
                  >
                    Xác nhận
                  </button>

                  <button
                    onClick={() => handleCancel()}
                    className="px-3 py-2 rounded bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="text-xs text-gray-500 animate-pulse">
              AI is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= Input ================= */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-3">

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Hãy hỏi tôi bất kỳ thứ gì ..."
            disabled={loading}
            className="
              flex-1
              resize-none
              rounded-2xl
              border
              px-4
              py-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-brand/40 focus:border-brand/30
              max-h-45
              overflow-y-auto
              disabled:opacity-50
              custom-scroll
              text-black
            "
          />

          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="
              bg-brand
              text-white
              p-3
              rounded-2xl
              hover:bg-brand-light
              transition
              disabled:opacity-50
              mb-2
            "
          >
            <Send size={20} />
          </button>

        </div>
      </div>

      {/* ================= Custom Scrollbar Style ================= */}
      <style>
        {`
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(15, 118, 110, 0.4) transparent;
          }

          .custom-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(14, 165, 233, 0.5);
            border-radius: 20px;
          }

          .custom-scroll::-webkit-scrollbar-button {
            display: none; /* Ẩn 2 mũi tên */
          }
        `}
      </style>

    </div>
  );
}