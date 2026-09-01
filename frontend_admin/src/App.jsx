import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { AiConfigPage } from "./pages/AiConfigPage";
import { RecipesPage } from "./pages/RecipesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* Redirect trang chủ mặc định về /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Các Route chức năng Admin */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="ai-config" element={<AiConfigPage />} />
          <Route path="recipes" element={<RecipesPage />} />
        </Route>

        {/* Bẫy các đường dẫn không tồn tại */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}