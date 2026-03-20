import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function StudentLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors
        ${active
          ? 'bg-amber-400 text-slate-900'
          : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}>
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">MiniLearning</span>
          </div>
          <div className="flex items-center gap-1">
            {navLink('/student/dashboard', 'Browse Courses')}
            {navLink('/student/my-courses', 'My Courses')}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-slate-400 text-sm hidden md:block">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-slate-400 hover:text-white border border-slate-700
              hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}