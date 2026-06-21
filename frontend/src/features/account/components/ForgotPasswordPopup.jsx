import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SendEmailApi, VerifyOtpApi, ResetPasswordApi } from "../api/FogotPasswordApi";

export function ForgotPasswordForm({ onCancel }) {
  const devMode = "production"

  // USESTATE
  const [email, setEmail] = useState("") // quản lý email nhập vào từ user
  const [otp, setOtp] = useState("") // verify OTP
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // API RESET PASSWORD
  const handleResetPassword = async () => {
    try {
      if (newPassword.length < 8) {
        alert("Mật khẩu phải ≥ 8 ký tự");
        throw Error("Mật khẩu phải ≥ 8 ký tự")
      }
      if (newPassword !== confirmPassword) {
        alert("Mật khẩu nhập lại không khớp");
        throw Error("Mật khẩu nhập lại không khớp")
      }

      const response = await ResetPasswordApi(devMode, email, newPassword)
    } catch (err) {
      console.error(err)

      if (devMode == "dev") nextStep()
      else alert("Reset password thất bại")
    }
  };

  // API SEND EMAIL TO SERVER
  const sendEmail = async () => {
    try {
      const data = await SendEmailApi(devMode, email)

      console.log("data:", data)

      nextStep(); // nếu tới đây = OK

    } catch (err) {
      console.error(err)

      if (devMode === "dev") {
        nextStep(); // dev vẫn cho đi tiếp
      } else {
        alert("Gửi email thất bại")
      }
    }
  };

  // API VERIFY OTP
  const verifyOtp = async () => {
    try {
      const response = await VerifyOtpApi(devMode, email, otp)

      nextStep()
    } catch (err) {
      console.error(err)

      if (devMode === "dev") nextStep();
      else alert("OTP sai hoặc hết hạn");
    }  
  };

  // TEST
  useEffect(() => {
    console.log("Email: ", email)
  }, [email])

  return (
    <div className="relative text-black">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 flex items-center">
            <div
              className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                step >= s
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > s ? "bg-black" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Animated Step Content */}
      <div className="min-h-43 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold">Nhập Email</h2>
                <p className="text-gray-600">
                  Chúng tôi sẽ gửi mã OTP về email của bạn.
                </p>
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold">Nhập OTP</h2>
                <p className="text-gray-600">
                  Vui lòng nhập mã OTP đã gửi.
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập OTP"
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold">Đặt lại mật khẩu</h2>
                <p className="text-gray-600">
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </p>

                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />

                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-3 text-center">
                <CheckCircle className="mx-auto text-green-500" size={48} />
                <h2 className="text-xl font-bold">Đổi mật khẩu thành công</h2>
                <p className="text-gray-600">
                  Bạn có thể đăng nhập lại ngay bây giờ.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step === 1 && (
          <button onClick={sendEmail} className="btn">
            Next <ArrowRight size={16} />
          </button>
        )}

        {step === 2 && (
          <button onClick={verifyOtp} className="btn">
            Verify OTP
          </button>
        )}

        {step === 3 && (
          <button onClick={handleResetPassword} className="btn">
            Xác nhận
          </button>
        )}

        {step === 4 && (
          <button onClick={onCancel} className="btn">
            Quay lại đăng nhập
          </button>
        )}
      </div>
    </div>
  );
}


export function ForgotPasswordPopup({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="modal-panel relative z-10 w-full max-w-lg top-100">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="font-display text-xl font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-lg"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
