import { useState } from "react";
import { Check, Crown, Zap, ShieldCheck, Sparkles, Copy, CheckCircle2 } from "lucide-react";

export function UpgradeProModal({ onClose, OnUpgradeSuccess }) {
  const [step, setStep] = useState("pricing"); // "pricing" | "checkout"
  const [selectedPlan, setSelectedPlan] = useState("monthly"); // "monthly" | "yearly"
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    monthly: { price: "99.000đ", period: "/tháng", originalPrice: "149.000đ" },
    yearly: { price: "79.000đ", period: "/tháng", billText: "Thanh toán 948.000đ/năm (Tiết kiệm 35%)", originalPrice: "149.000đ" }
  };

  // Giả lập xác nhận thanh toán thành công
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      OnUpgradeSuccess();
    }, 2500);
  };

  return (
    <div className="text-slate-200">
      {step === "pricing" ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Crown className="w-4 h-4" /> Smart-Recipe Pro
            </div>
            <h2 className="text-2xl font-bold text-white">Mở khóa sức mạnh AI Cộng sự</h2>
            <p className="text-sm text-slate-400">Tối ưu dinh dưỡng và lịch tập cá nhân hóa không giới hạn</p>
          </div>

          {/* Toggle Monthly / Yearly */}
          <div className="flex justify-center">
            <div className="bg-slate-800/80 p-1 rounded-xl border border-white/10 flex gap-1">
              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedPlan === "monthly" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Theo Tháng
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan("yearly")}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                  selectedPlan === "yearly" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Theo Năm <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30">-35%</span>
              </button>
            </div>
          </div>

          {/* Price Tag */}
          <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-extrabold text-white">{plans[selectedPlan].price}</span>
              <span className="text-sm text-slate-400">{plans[selectedPlan].period}</span>
              <span className="text-xs text-slate-500 line-through">{plans[selectedPlan].originalPrice}</span>
            </div>
            {plans[selectedPlan].billText && (
              <p className="text-xs text-amber-400/90 mt-1">{plans[selectedPlan].billText}</p>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-2.5">
            {[
              "AI Co-pilot phản hồi siêu tốc & chính xác (Qwen2.5 7B)",
              "Tự động lập thực đơn tuần theo chỉ số calo BMR/TDEE",
              "AI Phân tích hình ảnh bữa ăn & tự động tính Calo",
              "Gợi ý công thức thay thế nguyên liệu theo sở thích",
              "Không quảng cáo & Hỗ trợ ưu tiên 24/7"
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-300">{feat}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => setStep("checkout")}
            className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:opacity-90 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Nâng cấp ngay
          </button>
        </div>
      ) : (
        /* Checkout Step (Mock QR Payment) */
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white">Thanh toán qua Mã QR</h3>
            <p className="text-xs text-slate-400">Quét mã QR bằng ứng dụng Ngân hàng / MoMo để hoàn tất</p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-3">
            {/* Mock QR Code Image */}
            <div className="bg-white p-3 rounded-xl shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SMARTRECIPE_PRO_${selectedPlan.toUpperCase()}`}
                alt="QR Code Payment"
                className="w-40 h-40"
              />
            </div>

            <div className="w-full space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Ngân hàng:</span> <span className="font-semibold text-white">MB Bank</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Chủ tài khoản:</span> <span className="font-semibold text-white">LE DUC THANG</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Số tài khoản:</span> <span className="font-semibold text-amber-400 flex items-center gap-1">0987654321 <Copy className="w-3 h-3 cursor-pointer" /></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Số tiền:</span> <span className="font-bold text-emerald-400">{selectedPlan === "monthly" ? "99.000đ" : "948.000đ"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Nội dung chuyển khoản:</span> <span className="font-semibold text-amber-400">SR PRO PROMO</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("pricing")}
              className="w-1/3 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPayment}
              className="w-2/3 py-2.5 rounded-xl font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-500 transition-all text-sm flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  Đang xác thực...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Tôi đã chuyển khoản
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}