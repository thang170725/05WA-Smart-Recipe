import { useState } from "react"
import RegisterApi from "../api/RegisterApi"
import SuccessPopup from "../../../components/SuccessPopup"
import { 
  User, 
  Lock, 
  Phone,
  Eye,
  EyeOff
} from "lucide-react"
import Loading from "../../../components/Loading"
import { UsernameRegExp, PasswordRegExp, PhoneRegExp, EmailRegExp } from "../../../components/RegExp"
import { CalcAge } from "../../../components/Datetime"

export function RegisterForm({ onCancel, onSwitchToLogin }) {
  // STATE 
  const [loading, setLoading] = useState(false) 
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "birth_date") {
      const age = CalcAge(value)

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

  // USESTATE'S REGISTERFORM
  const [form, setForm] = useState({
    fullname: "",
    birth_date: "",
    age: 0,
    password: "",
    address: "",
    phone: "",
    gender: "",
    email: ""
  })

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!form.fullname.trim()){
        throw new Error("Tên không được để trống")
      }

      if (!form.birth_date){
        throw new Error("Ngày sinh không được để trống")
      }

      if (!PasswordRegExp().test(form.password)){
        throw new Error("Password ≥8 ký tự, gồm chữ, số , ký tự đặc biệt và ký tự in hoa")
      }

      if (!PhoneRegExp().test(form.phone)){
        throw new Error("Số điện thoại không hợp lệ")
      }

      if (!form.gender) {
        throw new Error("Vui lòng chọn giới tính")
      }

      if (!form.address.trim()){
        throw new Error("Vui lòng nhập địa chỉ")
      }  

      if (!EmailRegExp().test(form.email)){
        throw new Error("Email không hợp lệ")
      }

      await RegisterApi(form)

      setSuccess(true)
    } catch (error) {
      setError(error.message || "Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form
        className="space-y-5 relative z-10"
        onSubmit={handleSend}
      >
        <div className="grid grid-cols-2 gap-5">
          {/* FULLNAME */}
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
          
          {/* BIRTH DATE */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-600">
              Ngày sinh <span className="text-red-700">(*)</span>
            </label>
            <input
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              type="date"
              className="input-light"
            />
          </div>

          {/* AGE */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Tuổi
            </label>
            <input
              name="age"
              value={form.age}
              onChange={handleChange}
              disabled
              placeholder="21"
              type="number"
              className="input-light"
            />
          </div>

          {/* Username - Email */}
          <div className="col-span-3">
            <label className="label-light">
              Email
            </label>

            <div className="relative mt-1">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="text"
                placeholder="Nhập email của bạn"
                className="input-light pl-10"
              />
            </div>
          </div>

          {/* Password */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="col-span-3">
            <label className="text-sm font-medium text-slate-600">
              Địa chỉ
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              type="text"
              placeholder="Xã Hoài Đức, Hà Nội"
              className="input-light"
            />
          </div>

          {/* Phone */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-600">
              Phone
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

          {/* GENDER */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Giới tính <span className="text-red-700">(*)</span>
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="input-light"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        {/* switch to register */}
        <div className="flex justify-end text-sm">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-slate-600 hover:text-brand transition-colors"
          >
            Đã có tài khoản
          </button>
        </div>

        {/* RESPONSE IF ERROR */}
        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          >
            Thoát
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-2.5! disabled:opacity-60"
          >
            {loading ? <Loading /> : "Tạo tài khoản"}
          </button>
        </div>
      </form>

      {success && (
        <SuccessPopup
          onClose={() => {
            setSuccess(false)
            onCancel() // đóng popup đăng ký
          }}
        />
      )}
    </>
  )
}


export function RegisterPopup({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="modal-panel relative z-10 w-full max-w-2xl top-100">
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
