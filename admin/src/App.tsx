import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import PayoutRequestsPage from './pages/PayoutRequestsPage';
import CoursesPage from './pages/CoursesPage';
import AdminLayout from './layouts/AdminLayout';

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/" element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }>
          <Route path="dashboard" element={<PayoutRequestsPage />} />
          <Route path="courses" element={<CoursesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}