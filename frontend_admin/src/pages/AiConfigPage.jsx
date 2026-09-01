import { useState } from "react";
import { initialAiConfig } from "../data/mockData";
import { Bot, Save, Sliders, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

export function AiConfigPage() {
  const [config, setConfig] = useState(initialAiConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-400" />
            Cấu hình AI Engine & Multi-Node Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Điều chỉnh Model LLM và System Prompt cho từng Node trong quy trình xử lý câu hỏi của người dùng.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/10"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Đã lưu Cấu hình!" : "Lưu Thay Đổi"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NODE CONFIGURATION FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* NODE 1: QUERY REWRITER */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                  N1
                </span>
                <h3 className="font-bold text-sm text-white">Node 1: Query Rewriter / Intent Expander</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Xử lý ngầm
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Nhận câu hỏi ngắn gọn từ người dùng, đọc chỉ số cơ thể (Chiều cao, Cân nặng, TDEE, Mục tiêu) để viết lại thành prompt chuẩn cho Node 2.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Lựa chọn AI Model cho Node 1:</label>
              <select
                value={config.activeNode1Model}
                onChange={(e) => setConfig({ ...config, activeNode1Model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Qwen/Qwen2.5-7B-Instruct">Qwen 2.5 7B Instruct (Nhanh & Tối ưu chi phí)</option>
                <option value="GPT-4o-mini">OpenAI GPT-4o-mini</option>
                <option value="Llama-3.1-8B">Meta Llama 3.1 8B</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">System Prompt (Node 1):</label>
              <textarea
                rows={4}
                value={config.node1Prompt}
                onChange={(e) => setConfig({ ...config, node1Prompt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>

          {/* NODE 2: HEALTH & MEAL GENERATOR */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                  N2
                </span>
                <h3 className="font-bold text-sm text-white">Node 2: Health Assessment & Roadmap Generator</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Chuyên môn sâu
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Lựa chọn AI Model cho Node 2:</label>
              <select
                value={config.activeNode2Model}
                onChange={(e) => setConfig({ ...config, activeNode2Model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="GPT-4o-mini">OpenAI GPT-4o-mini (Khuyên dùng)</option>
                <option value="Claude-3-5-Sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="Gemini-1.5-Flash">Google Gemini 1.5 Flash</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">System Prompt (Node 2):</label>
              <textarea
                rows={4}
                value={config.node2Prompt}
                onChange={(e) => setConfig({ ...config, node2Prompt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* HYPERPARAMETERS & AI STATS */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Tham số Sinh từ (Hyperparameters)
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Temperature (Sáng tạo)</span>
                  <span className="font-mono text-amber-400 font-bold">{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Max Tokens Đầu ra</span>
                  <span className="font-mono text-amber-400 font-bold">{config.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="2048"
                  step="128"
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Ghi chú cho Developer</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Model tại **Node 1** nên giữ độ sáng tạo (Temperature) thấp (khoảng **0.2 - 0.4**) để tránh suy luận sai thông tin sinh học của người dùng khi biến đổi câu hỏi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}