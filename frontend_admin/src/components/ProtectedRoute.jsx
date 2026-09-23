// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  // Kiểm tra xem đã đăng nhập chưa (ví dụ qua localStorage)
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Nếu chưa đăng nhập thì chuyển hướng sang trang /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập thì render các Route con bên trong
  return <Outlet />;
}