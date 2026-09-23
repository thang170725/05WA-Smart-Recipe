// ========== nơi import thư viện =========
import { useState } from "react"
import { Bell, Crown, Sparkles } from "lucide-react";
import { LoginForm } from "./LoginForm.jsx"
import { RegisterForm } from "./RegisterForm.jsx"
import { Avatar } from "../../../components/Avatar.jsx"
import { ForgotPasswordForm } from "./ForgotPasswordPopup"
import { useAuth } from "../../../context/AuthContext.jsx"
import { Popup } from "../../../components/Popup.jsx";
import { AuthorStoryDialog } from "../../../components/AuthorStoryDialog.jsx"
import { UpgradeProModal } from "./UpgradeProModal.jsx";
import { GoogleCompleteProfileForm } from "../../../components/GoogleCompleteProfileForm.jsx";

export function AuthSection() {
  // STATE hiển thị Dialog Lời tâm sự
  const [showAuthorStory, setShowAuthorStory] = useState(false)
  const [googleData, setGoogleData] = useState(null)

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

  //
  // ======== chức năng upgrade bnr pro (bnr trả phí) ========
  //
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userPlan, setUserPlan] = useState("free"); // 'free' | 'pro'
  const handleUpgradeSuccess = () => {
    setUserPlan("pro");
    setShowUpgradeModal(false);
  };

  // ========== khi đã đăng nhập thành công thì hiện avatar =======
  if (user) {
    return (
      <>
        <div className="flex justify-end items-center gap-3 sm:gap-4">
          {/* Badge gói tài khoản & button nâng cấp */}
          {userPlan === "pro" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm shadow-amber-500/10">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>PRO VIP</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                FREE
              </span>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-amber-500/10"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Nâng cấp Pro</span>
              </button>
            </div>
          )}

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

        {/* Popup Nâng Cấp Pro */}
        {showUpgradeModal && (
          <Popup
            open={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            maxWidth="max-w-md"
          >
            <UpgradeProModal
              onClose={() => setShowUpgradeModal(false)}
              OnUpgradeSuccess={handleUpgradeSuccess}
            />
          </Popup>
        )}
      </>     
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
            onNeedGoogleRegister={(data) => {
              setGoogleData(data)
              setAuthMode("googleCompleteProfile")
            }}
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

{isAuthModalOpen && authMode === "googleCompleteProfile" && googleData && (
  <Popup open={isAuthModalOpen} onClose={closeAuthModal} title="Hoàn tất thông tin" maxWidth="max-w-2xl">
    <GoogleCompleteProfileForm
      registrationToken={googleData.registrationToken}
      email={googleData.email}
      name={googleData.name}
      onDone={() => closeAuthModal()}
      onCancel={closeAuthModal}
    />
  </Popup>
)}
    </>
  );
}