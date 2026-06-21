import { LoginForm, LoginPopup } from "./LoginForm.jsx"
import { RegisterForm, RegisterPopup } from "./RegisterForm.jsx"
import { useEffect, useState, useRef } from "react"
import { Avatar } from "../../../components/Avatar.jsx"
import { Bell } from "lucide-react";
import { ForgotPasswordForm ,ForgotPasswordPopup } from "./ForgotPasswordPopup"
import { useAuth } from "../../../context/AuthContext.jsx"

export function AuthSection() {
  const [open, setOpen] = useState(false) // cho biết popup có mở không
  const [mode, setMode] = useState("login") // dùng để mở popup login, đăng ký hoặc v.v

  const {user, setUser, logout} = useAuth()

  const hasOpenedRef = useRef(false)
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) return
      
    const timer = setTimeout(() => {
      if (hasOpenedRef.current) return
      hasOpenedRef.current = true
        setMode("login")
        setOpen(true)
      }, 2000)

      return () => clearTimeout(timer)
  }, [])

  if (user) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <p className="hidden sm:block text-sm text-slate-300">
          <span className="text-slate-500">Xin chào,</span>{" "}
          <span className="font-semibold text-white">{user.fullname}</span>
        </p>

        <Avatar
          user={{
            ...user,
            avatar: user.avatar_url,
          }}
          onLogout={logout}
        />

        <button
          type="button"
          className="p-2.5 rounded-xl bg-white/8 border border-white/12 text-slate-300 hover:text-white hover:bg-white/12 transition-all"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("login")
            setOpen(true)
          }}
          className="btn-secondary text-sm !py-2 !px-4"
        >
          Đăng nhập
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("register")
            setOpen(true)
          }}
          className="btn-primary text-sm !py-2 !px-4"
        >
          Đăng ký
        </button>
      </div>
      
      {/* Mở Popup đăng nhập */}
      {open && mode === "login" && <LoginPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Đăng nhập"
      >
        <LoginForm
          onCancel={() => setOpen(false)}
          onSwitchToRegister={() => setMode("register")}
          onSwitchToForgotPassword={() => setMode("forgotPassword")}
          onLoginSuccess={() => {
            setOpen(false)
          }}
        />
      </LoginPopup>}

      {/* Mở Popup đăng ký */}
      {open && mode === "register" && <RegisterPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Đăng ký"
      >
        <RegisterForm
          onCancel={() => setOpen(false)}
          onSwitchToLogin={() => setMode("login")}
        />
      </RegisterPopup>}
      
      {/* Mở Popup quên mật khẩu */}
      {open && mode === "forgotPassword" && <ForgotPasswordPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Quên mật khẩu"
      >    
        <ForgotPasswordForm 
          onCancel={() => setMode("login")}
        />
      </ForgotPasswordPopup>}
    </>
  )
}
