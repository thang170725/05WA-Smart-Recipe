// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { AiConfigPage } from "./pages/AiConfigPage";
import { RecipesPage } from "./pages/RecipesPage";
import { FoodsPage } from "./pages/FoodsPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Công khai (Public Route) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Redirect trang chủ mặc định "/" sang "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Cụm Route được bảo vệ (Protected Routes) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="foods" element={<FoodsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="ai-config" element={<AiConfigPage />} />
            <Route path="recipes" element={<RecipesPage />} />
          </Route>
        </Route>

        {/* Bẫy các đường dẫn không tồn tại -> Đẩy về /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}