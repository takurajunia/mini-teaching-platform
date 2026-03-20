import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import MyCoursesPage from './pages/student/MyCoursesPage';

import InstructorDashboardPage from './pages/instructor/InstructorDashboardPage';
import InstructorSessionsPage from './pages/instructor/InstructorSessionsPage';
import InstructorPayoutsPage from './pages/instructor/InstructorPayoutsPage';

function RequireAuth({ children, allowedType }: {
  children: React.ReactNode;
  allowedType?: 'student' | 'instructor';
}) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (allowedType && user?.type !== allowedType) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Student routes */}
        <Route path="/student" element={
          <RequireAuth allowedType="student">
            <StudentLayout />
          </RequireAuth>
        }>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
        </Route>

        {/* Instructor routes */}
        <Route path="/instructor" element={
          <RequireAuth allowedType="instructor">
            <InstructorLayout />
          </RequireAuth>
        }>
          <Route path="dashboard" element={<InstructorDashboardPage />} />
<Route path="sessions" element={<InstructorSessionsPage />} />
<Route path="payouts" element={<InstructorPayoutsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}