import { useState, useEffect } from "react"
import { RegisterApi, checkEmailApi } from "../api/RegisterApi"
import SuccessPopup from "../../../components/SuccessPopup"
import { 
  User, Mail, MapPinPen,
  Lock, Transgender,
  Phone,
  Eye,
  EyeOff,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Target
} from "lucide-react"

import { PasswordRegExp, PhoneRegExp, EmailRegExp, FullNameRegExp, CalculateAge, AgeRegExp,
  HeightRegExp, WeightRegExp
} from "../../../components/RegExp"

import { HealthInfoForm } from "./HealthInfoForm"
import { useRegisterFormValidator, useEmailChecker } from "../../../hooks/RegisterForm"

export function RegisterForm({ onCancel, onSwitchToLogin, onRegisterSuccess }) {
  const devMode = "production"

  const [loading, setLoading] = useState(false) 
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)

  // =====================================================
  // ========= chức năng đăng ký tài khoản user =========
  // =====================================================
  const [form, setForm] = useState({
    fullname: "",
    birth_date: "",
    age: 0,
    password: "",
    address: "",
    phone: "",
    gender: "",
    email: "",
    height: "",
    weight: "",
    activity_level: "",
    target_goal: ""
  })
  
  // bắt lỗi input của user
  const [error, setError] = useRegisterFormValidator(form)
  
  const handleChange = (e) => {
    let { name, value } = e.target

    if (name === "email") {
      setEmailError("")
      setEmailAvailable(false)
    }

    if (name === "birth_date") {
      const age = CalculateAge(value)

      setForm(prev => ({
        ...prev,
        birth_date: value,
        age: age
      }))
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  //
  // ======== kiểm tra trùng email ========
  //
  const [emailError, emailAvailable, setEmailError, setEmailAvailable] = useEmailChecker(devMode, error, form.email);

  const handleNextStep = (e) => {
    e.preventDefault()
    setError("")

    try {
      if (emailError || !emailAvailable) {
        throw new Error("Vui lòng sử dụng một email hợp lệ và chưa đăng ký")
      }

      setStep(2)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleFinalSubmit = async (e) => {
    if (!agreements.terms || !agreements.privacy) {
      alert("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.")
      return
    }

    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!HeightRegExp().test(String(form.height))) {
        throw new Error("Chiều cao không hợp lệ (cho phép từ 50cm - 250cm)")
      }
      if (!WeightRegExp().test(String(form.weight))) {
        throw new Error("Cân nặng không hợp lệ (cho phép từ 20kg - 300kg)")
      }
      if (!form.activity_level) throw new Error("Vui lòng chọn mức độ vận động")
      if (!form.target_goal) throw new Error("Vui lòng chọn mục tiêu cá nhân")

      await RegisterApi(devMode, form) 
      
      if (onRegisterSuccess) {
        onRegisterSuccess()
      }
      
    } catch (error) {
      setError(error.message || "Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    healthDisclaimer: false,
    marketing: false,
  })
  const handleAgreementChange = (e) => {
    const { name, checked } = e.target
  
    setAgreements(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  return (
    <>
      <div className="relative z-10 w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out w-[200%]"
          style={{ transform: `translateX(${step === 1 ? '0%' : '-50%'})` }}
        >
          <div className="w-1/2 shrink-0 pr-4 mr-2">
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-3"> 
                  <label className="label-light">
                    Tên đầy đủ <span className="text-red-700">(*)</span>
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      name="fullname"
                      value={form.fullname}
                      onChange={handleChange}
                      type="text"
                      placeholder="Le Duc Thang"
                      className="input-light pl-10"
                    />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="label-light">
                    Ngày sinh <span className="text-red-700">(*)</span>
                  </label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                      name="birth_date"
                      value={form.birth_date}
                      onChange={handleChange}
                      type="date"
                      className="input-light pl-10"
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="text-sm font-medium text-slate-600">Tuổi</label>
                  <div className="relative mt-1">
                    <input
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      disabled
                      placeholder="21"
                      type="number"
                      className="input-light bg-slate-50"
                    />
                  </div>
                </div>

                <div className="col-span-3">
                  <label className="label-light">
                    Email <span className="text-red-700">(*)</span>
                  </label>
                  <div className="relative mt-1 flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="Nhập email của bạn"
                        className={`input-light w-full pl-10 ${
                          emailError
                            ? "border-red-400 focus:border-red-500"
                            : emailAvailable
                              ? "border-green-400 focus:border-green-500"
                              : ""
                        }`}
                      />
                    </div>
                  </div>
                  {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
                </div>

                <div className="col-span-3">
                  <label className="text-sm font-medium text-slate-600">
                    Mật khẩu <span className="text-red-700">(*)</span>
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      name="password"
                      key={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="input-light pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="col-span-3">
                  <label className="text-sm font-medium text-slate-600">
                    Địa chỉ <span className="text-red-700">(*)</span>
                  </label>
                  <div className="relative mt-1">
                    <MapPinPen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      type="text"
                      placeholder="Xã Hoài Đức, Hà Nội"
                      className="input-light pl-10"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-600">
                    Phone <span className="text-red-700">(*)</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      type="text"
                      placeholder="0123 456 789"
                      className="input-light pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Giới tính <span className="text-red-700">(*)</span>
                  </label>
                  <div className="relative mt-1">
                    <Transgender className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="input-light pl-10"
                    >
                      <option value="">Chọn</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>          
                </div>
              </div>

              <div className="flex justify-end text-sm">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-slate-600 hover:text-brand transition-colors"
                >
                  Đã có tài khoản
                </button>
              </div>

              {error && step === 1 && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-ghost text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                >
                  Thoát
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary py-2.5!"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>

          <div className="w-1/2 shrink-0 pr-4">
            <HealthInfoForm 
              form={form} 
              handleChange={handleChange} 
              onBack={() => {
                setStep(1)
                setError("")
              }}
              onSubmit={handleFinalSubmit}
              loading={loading}
              agreements={agreements}
              handleAgreementChange={handleAgreementChange}
            />
          
            {error && step === 2 && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>
        </div>
      </div>

      {success && (
        <SuccessPopup
          onClose={() => {
            setSuccess(false)
            onCancel() 
          }}
        />
      )}
    </>
  )
}