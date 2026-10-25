import { useState, useRef, useEffect, useCallback } from "react";
import { AiAssistantApi, ResumeAiApi, ConfirmAiActionApi } from "../api/AIAssistantApi";

// Import các sub-components đã tách
import { AiHeader } from "../components/AiAssistant/AiHeader";
import { AiMessageList } from "../components/AiAssistant/AiMessageList";
import { AiInputBox } from "../components/AiAssistant/AiInputBox";

export default function AiAssistant({ devMode }) {
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState([]);

  const [interruptType, setInterruptType] = useState(null);
  // Mục đích: Lưu trạng thái hiện tại của cơ chế ngắt quãng theo luồng mới (Phase 3/4 Agent).
  // Các giá trị có thể nhận:
  // null: Trạng thái bình thường, không có ngắt quãng nào.
  // "ask_user": AI đang đặt câu hỏi phụ (clarification/options) và đang chờ người dùng bấm chọn hoặc gõ câu trả lời để tiếp tục.   
  // "confirm": AI cần người dùng xác nhận (Xác nhận hoặc Hủy) trước khi thực hiện một hành động quan trọng (ví dụ: ghi dữ liệu vào Database).   

  const [interruptPayload, setInterruptPayload] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  // Mục đích: Biến lưu trữ tương thích ngược (Backward-compatibility) cho các phiên bản cũ của hệ thống, lưu ID của hành động đang chờ xác nhận (action_id).   
  // Các giá trị có thể nhận:
  // null: Không có hành động nào đang chờ.
  // Một chuỗi ID cụ thể (ví dụ: "action_xyz"): Hệ thống đang chờ người dùng bấm nút Xác nhận/Hủy cho hành động đó trước khi cho phép chạy tiếp các câu lệnh khác.   

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Xin chào! Tôi là trợ lý AI của Smart ReCipe và là chuyên gia dinh dưỡng cá nhân của bạn.",
    },
    {
      role: "assistant",
      type: "suggestions",
      content: "Dưới đây là một số chủ đề tôi có thể hỗ trợ bạn ngay lúc này:",
      options: [
        { icon: "🤖", title: "Trợ lý ảo", desc: "Tư vấn kiến thức về dinh dưỡng Q&A, thao tác với dữ liệu cá nhân."},
        { icon: "🍏", title: "Thực đơn cá nhân hóa", desc: "Gợi ý bữa ăn theo sở thích, calo và mục tiêu của bạn." },
        { icon: "🏃", title: "Huấn luyện viên ảo", desc: "Lên lộ trình tập luyện và dự báo kết quả thay đổi cơ thể." },
        { icon: "📊", title: "Phân tích sức khỏe", desc: "Đọc dữ liệu cá nhân và đánh giá xu hướng thể trạng." },
        { icon: "📋", title: "Báo cáo tiến độ", desc: "Tóm tắt kết quả rèn luyện và ăn uống trong tuần qua." },
      ],
    },
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, workflow, loading]);

  const handleInput = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  const handleWorkflowEvent = useCallback((event) => {
    if (event.type !== "workflow") return;

    setWorkflow((prev) => {
      const nextItem = {
        node: event.node,
        status: event.status,
        label: event.label,
        message: event.message,
      };

      if (event.status === "running") {
        const last = prev[prev.length - 1];
        if (last && last.node === event.node && last.status === "running") {
          const next = [...prev];
          next[next.length - 1] = { ...last, message: event.message || last.message, label: event.label || last.label };
          return next;
        }
        const closed = prev.map((item) =>
          item.status === "running" ? { ...item, status: "completed" } : item
        );
        return [...closed, nextItem];
      }

      const reverseIdx = [...prev].reverse().findIndex((item) => item.node === event.node);
      if (reverseIdx === -1) return [...prev, nextItem];
      const realIdx = prev.length - 1 - reverseIdx;
      const next = [...prev];
      next[realIdx] = { ...next[realIdx], status: event.status, label: event.label || next[realIdx].label, message: event.message || next[realIdx].message };
      return next;
    });
  }, []);

  const processEvent = useCallback((event) => {
    if (event.type === "workflow") {
      handleWorkflowEvent(event);
      return;
    }

    if (event.type === "ask_user") {
      setInterruptType("ask_user");
      setInterruptPayload(event);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: event.question || "Bạn muốn mình hỗ trợ gì?",
          type: "ask_user",
          options: event.options || [],
        },
      ]);
      return;
    }

    if (event.type === "confirm") {
      setInterruptType("confirm");
      setInterruptPayload(event);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: event.question || "Bạn có muốn thực hiện thao tác này không?",
          type: "confirm_interrupt",
          options: event.options || ["Xác nhận", "Hủy"],
        },
      ]);
      return;
    }

    if (event.type === "answer" && event.status === "WAIT_CONFIRM") {
      setPendingAction(event.action_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: event.reply, type: "confirm" },
      ]);
      return;
    }

    if (
      event.type === "answer" &&
      event.status === "ASK_USER" &&
      Array.isArray(event.clarify_options) &&
      event.clarify_options.length > 0
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: event.reply || event.clarify_question || "Bạn muốn mình hỗ trợ gì?",
          type: "ask_user",
          options: event.clarify_options,
        },
      ]);
      return;
    }

    if (event.type === "answer") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: event.reply || "Không có phản hồi." },
      ]);
    }
  }, [handleWorkflowEvent]);

  const handleSend = async (text) => {
    const message = text || input;
    if (!message.trim() || loading) return;

    if (interruptType || pendingAction) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Bạn đang có một thao tác chờ xác nhận. Vui lòng xử lý trước khi tiếp tục." },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setLoading(true);
    setWorkflow([]);

    try {
      await AiAssistantApi(devMode, { prompt: message }, processEvent);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => setWorkflow([]), 800);
    }
  };

  const handleResume = async (reply) => {
    if (!interruptType || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: reply }]);

    setMessages((prev) =>
      prev.map((msg) =>
        ["ask_user", "confirm_interrupt"].includes(msg.type)
          ? { ...msg, type: `${msg.type}_done` }
          : msg
      )
    );

    setInterruptType(null);
    setInterruptPayload(null);
    setLoading(true);
    setWorkflow([]);

    try {
      await ResumeAiApi(devMode, reply, processEvent);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Lỗi khi tiếp tục xử lý. Vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => setWorkflow([]), 800);
    }
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setLoading(true);
    try {
      const res = await ConfirmAiActionApi(devMode, pendingAction);
      setMessages((prev) =>
        prev.map((msg) => msg.type === "confirm" ? { ...msg, type: "confirmed" } : msg)
      );
      if (res) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      }
      setPendingAction(null);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Xác nhận thất bại. Vui lòng thử lại." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMessages((prev) =>
      prev.map((msg) => msg.type === "confirm" ? { ...msg, type: "cancelled" } : msg)
    );
    setPendingAction(null);
    setMessages((prev) => [...prev, { role: "assistant", content: "Đã hủy thao tác." }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trợ lý AI không hỗ trợ nhận diện giọng nói trên trình duyệt này.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + "px";
        }, 100);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const isInterrupted = !!(interruptType || pendingAction);

  return (
    <div className="flex flex-col h-full">
      <AiHeader isInterrupted={isInterrupted} />

      <AiMessageList
        messages={messages}
        workflow={workflow}
        loading={loading}
        handleSend={handleSend}
        handleResume={handleResume}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        messagesEndRef={messagesEndRef}
      />

      <AiInputBox
        input={input}
        setInput={setInput}
        handleInput={handleInput}
        handleKeyDown={handleKeyDown}
        handleSend={handleSend}
        handleResume={handleResume}
        startListening={startListening}
        isListening={isListening}
        loading={loading}
        isInterrupted={isInterrupted}
        textareaRef={textareaRef}
      />

      <style>{`
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(15, 118, 110, 0.4) transparent;
        }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(14, 165, 233, 0.5); border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-button { display: none; }
      `}</style>
    </div>
  );
}