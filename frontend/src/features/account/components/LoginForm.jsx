import { User, Lock, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import SuccessPopup from "../../../components/SuccessPopup"
import { LoginApi } from "../api/LoginApi"
import { GoogleLogin } from '@react-oauth/google'
import { LoginGoogleApi, CompleteGoogleRegisterApi } from "../api/LoginGoogleApi"
import { useAuth } from "../../../context/AuthContext"
import { useLoginFormValidator } from "../../../hooks/LoginForm"
import { Debug } from "../../../utils/Debug"
import { AuthLoader } from "../../../components/AuthLoader"

export function LoginForm({ 
  onCancel, 
  onLoginSuccess, 
  onSwitchToRegister, onSwitchToForgotPassword, 
  onNeedGoogleRegister 
}) {
  const devMode = "production"

  // ==========================================
  // ======== chức năng đăng nhập =============
  // ==========================================
  const [form, setForm] = useState({
    email: "",
    password: ""
  })
  // bắt regex
  const [error, setError] = useLoginFormValidator(form) 

  // bắt giá trị input và người dùng nhập vào
  const handleChange = (e) => {
    const { name, value } = e.target
  
    setForm(prev => ({
        ...prev,
        [name]: value
    }))
  }
  
  // gửi api và lưu token người dùng để duy trì đăng nhập
  const { setUser } = useAuth()
  const [phase, setPhase] = useState("idle") // idle | loading | success
  const handleSend = async (e) => {
    e.preventDefault()
    
    if (error || !form.email || !form.password) {
      alert("đăng nhập thất bại", error)
      return
    }

    setPhase("loading")
      
    try {
      const res = await LoginApi(devMode, form)

      if (devMode === "production") {
        setUser(res.user)
        localStorage.setItem("token", res.access_token)    
      }
    
      setPhase("success")
      await new Promise((resolve) => setTimeout(resolve, 700)) // giữ hiệu ứng ✓ trong 0.7s

      onLoginSuccess()
      setSuccess(true)
    } catch(err){
      console.error(err.message || "LOGIN Failed")
      setPhase("idle")
      setError("Sai email hoặc mật khẩu")
    }
  }

  // 
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <>
      <form className="space-y-5 relative z-10" method="POST" onSubmit={handleSend}>
        <div>
          <label className="label-light">Email</label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
            className="text-brand hover:text-brand-light transition-colors cursor-pointer"
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

                  const res = await LoginGoogleApi({ token: credentialResponse.credential })

                  if (res.status === "need_register") {
                    onNeedGoogleRegister({
                      registrationToken: res.registration_token,
                      email: res.email,
                      name: res.name,
                    })
                    return
                  }

                  localStorage.setItem("token", res.access_token)
                  setUser(res.user)
                  setSuccess(true)
                } catch (err) {
                  console.error("GOOGLE LOGIN ERROR:", err)
                  alert("Google login failed")
                }
              }}
              onError={() => console.log("Google Login Failed")}
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
            disabled={phase !== "idle" || !!error || !form.email || !form.password}
            className="btn-primary py-2.5! disabled:opacity-60"
          >
            {phase === "idle" ? "Đăng nhập" : <AuthLoader phase={phase} />}
          </button>
        </div>
      </form>
    </>
  )
}
