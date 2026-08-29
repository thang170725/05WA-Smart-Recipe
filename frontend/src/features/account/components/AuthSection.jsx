// ========== nơi import thư viện =========
import { useState } from "react"
import { LoginForm } from "./LoginForm.jsx"
import { RegisterForm } from "./RegisterForm.jsx"
import { Avatar } from "../../../components/Avatar.jsx"
import { Bell } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordPopup"
import { useAuth } from "../../../context/AuthContext.jsx"
import { Popup } from "../../../components/Popup.jsx";
import { AuthorStoryDialog } from "../../../components/AuthorStoryDialog.jsx"

export function AuthSection() {
  // STATE hiển thị Dialog Lời tâm sự
  const [showAuthorStory, setShowAuthorStory] = useState(false)

  const { 
    user, 
    logout, 
    isAuthModalOpen, 
    authMode, 
    setAuthMode, 
    openAuthModal, 
    closeAuthModal 
  } = useAuth();

  // Hàm xử lý sau khi Đăng ký thành công
  const handleRegisterSuccess = () => {
    closeAuthModal(); // 1. Đóng Popup Register
    setShowAuthorStory(true); // 2. Bật Popup Lời tâm sự của tác giả
  };

  // ========== khi đã đăng nhập thành công thì hiện avatar =======
  if (user) {
    return (
      <div className="flex justify-end items-center gap-3 sm:gap-4">
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

  // ============ chưa đăng nhập ============
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
        <Popup open={isAuthModalOpen} onClose={closeAuthModal} title="Đăng nhập" maxWidth="max-w-xl">
          <LoginForm
            onCancel={closeAuthModal}
            onSwitchToRegister={() => setAuthMode("register")}
            onSwitchToForgotPassword={() => setAuthMode("forgotPassword")}
            onLoginSuccess={() => closeAuthModal()} 
          />
        </Popup>
      )}

      {/* Popup đăng ký */}
      {isAuthModalOpen && authMode === "register" && (
        <Popup open={isAuthModalOpen} onClose={closeAuthModal} title="Đăng ký" maxWidth="max-w-2xl">
          <RegisterForm
            onCancel={closeAuthModal}
            onSwitchToLogin={() => setAuthMode("login")}
            onRegisterSuccess={handleRegisterSuccess} 
          />
        </Popup>
      )}

      {/* Popup quên mật khẩu */}
      {isAuthModalOpen && authMode === "forgotPassword" && (
        <Popup open={isAuthModalOpen} onClose={closeAuthModal} title="Quên mật khẩu">
          <ForgotPasswordForm onCancel={() => setAuthMode("login")} />
        </Popup>
      )}

      {/* ✅ Bọc bằng Popup chung để không bị lỗi UI */}
      {showAuthorStory && (
        <Popup 
          open={showAuthorStory} 
          onClose={() => {
            setShowAuthorStory(false);
            if ("speechSynthesis" in window) window.speechSynthesis.cancel();
          }} 
          title="Lời tâm sự từ Tác giả" 
          maxWidth="max-w-2xl"
        >
          <AuthorStoryDialog onClose={() => setShowAuthorStory(false)} />
        </Popup>
      )}
    </>
  );
}