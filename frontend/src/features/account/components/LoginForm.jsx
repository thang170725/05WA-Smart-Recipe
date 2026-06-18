import { User, Lock, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import SuccessPopup from "../../../components/SuccessPopup"
import LoginApi from "../api/LoginApi"
import { GoogleLogin } from '@react-oauth/google'
import { LoginGoogleApi } from "../api/LoginGoogleApi"
import { ForgotPasswordPopup } from "./ForgotPasswordPopup"
import { UsernameRegExp, PasswordRegExp } from "../../../components/RegExp"
import { useAuth } from "../../../context/AuthContext"
import { GetProfile } from "../../profile/api/ProfileApi"

export function LoginForm({ onCancel, onLoginSuccess, onSwitchToRegister, onSwitchToForgotPassword}) {
  // STATE
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target
  
    setForm(prev => ({
        ...prev,
        [name]: value
    }))
  }

  // USESTATE
  const [form, setForm] = useState({
    username: "",
    password: ""
  })
  const { setUser } = useAuth()

  // ====== API ========
  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
      
    try {
      if (!UsernameRegExp().test(form.username)){
        throw new Error("Username 4-20 ký tự, không dấu")
      }
      
      if (!PasswordRegExp().test(form.password)){
        throw new Error("Password ≥8 ký tự, gồm chữ thường, chữ hoa, số và ký thự đặc biệt")
      }

      const res = await LoginApi(form)
      setUser(res.user)
      
      localStorage.setItem("token", res.access_token)    

      onLoginSuccess()
      setSuccess(true)
    } catch(err){
      console.error(err.message || "LOGIN Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form className="space-y-5 relative z-10" method="POST" onSubmit={handleSend}>
        <div>
          <label className="label-light">
            Email
          </label>

          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              type="text"
              placeholder="Nhập email của bạn"
              className="input-light pl-10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="label-light">
            Mật khẩu
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

        {/* switch to register */}
        <div className="flex justify-between text-sm">
          <button
            type="button"
            className="text-brand hover:text-brand-light transition-colors"
            onClick={onSwitchToForgotPassword}
          >
            Quên mật khẩu
          </button>
          
          <button
            type="button"
            className="text-slate-600 hover:text-brand transition-colors"
            onClick={onSwitchToRegister}
          >
            Chưa có tài khoản
          </button>
        </div>

        <div className="flex justify-center gap-2">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  setLoading(true)
                
                  const res = await LoginGoogleApi({
                    token: credentialResponse.credential
                  })
                
                  localStorage.setItem("token", res.access_token)
                
                  setUser(res.user) 
                  setSuccess(true)
                } catch (err) {
                  console.error("GOOGLE LOGIN ERROR:", err)
                  alert("Google login failed")
                } finally {
                  setLoading(false)
                }
              }}
              onError={() => {
                console.log("Google Login Failed")
              }}
            />
          </div>
        </div>

        {/* error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* button */}
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
            className="btn-primary !py-2.5 disabled:opacity-60"
          >
            Đăng nhập
          </button>
        </div>
      </form>

      {success && (
        <SuccessPopup
          onClose={() => {
            setSuccess(false)
            onLoginSuccess()
            onCancel() // đóng popup đăng ký
          }}
        />
      )}
    </>
  )
}

export function LoginPopup({ open, onClose, title, children }) {
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
