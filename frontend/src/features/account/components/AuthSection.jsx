import { LoginForm } from "./LoginForm.jsx"
import { RegisterForm } from "./RegisterForm.jsx"
import { Avatar } from "../../../components/Avatar.jsx"
import { Bell } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordPopup"
import { useAuth } from "../../../context/AuthContext.jsx"
import { Popup } from "../../../components/Popup.jsx";

export function AuthSection() {
  const { 
    user, 
    logout, 
    isAuthModalOpen, 
    authMode, 
    setAuthMode, 
    openAuthModal, 
    closeAuthModal 
  } = useAuth();

  //
  // ========== khi đã đăng nhập thành công thì hiện avatar =======
  //
  if (user) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <p className="hidden sm:block text-sm text-slate-300">
          <span className="text-slate-500">Xin chào,</span>{" "}
          <span className="font-semibold text-white/90">{user.email}</span>
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

  //
  // ============ chưa đăng nhập thì hiện nút 2 nút bấm đăng nhập và đăng ký + các popup up điều hướng ============
  //
  return (
    <>
      <div className="flex justify-end items-center gap-2">
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="btn-secondary text-sm py-2! px-4!"
        >
          Đăng nhập
        </button>

        <button
          type="button"
          onClick={() => openAuthModal("register")}
          className="btn-primary text-sm py-2! px-4!"
        >
          Đăng ký
        </button>
      </div>

      {/* Popup đăng nhập */}
      {isAuthModalOpen && authMode === "login" && (
        <Popup open={isAuthModalOpen} onClose={closeAuthModal} title="Đăng nhập" maxWidth="max-w-2xl">
          <LoginForm
            onCancel={closeAuthModal}
            onSwitchToRegister={() => setAuthMode("register")}
            onSwitchToForgotPassword={() => setAuthMode("forgotPassword")}
            onLoginSuccess={() => closeAuthModal()} // ✅ Sửa thêm cặp dấu ngoặc ()
          />
        </Popup>
      )}

      {/* Popup đăng ký */}
      {isAuthModalOpen && authMode === "register" && (
        <Popup open={isAuthModalOpen} onClose={closeAuthModal} title="Đăng ký" maxWidth="max-w-2xl">
          <RegisterForm
            onCancel={closeAuthModal}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        </Popup>
      )}

      {/* Popup quên mật khẩu */}
      {isAuthModalOpen && authMode === "forgotPassword" && (
        <Popup open={isAuthModalOpen} onClose={closeAuthModal} title="Quên mật khẩu">
          <ForgotPasswordForm onCancel={() => setAuthMode("login")} />
        </Popup>
      )}
    </>
  );
}
