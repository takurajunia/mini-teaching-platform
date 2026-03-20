import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const navLink = (to: string, label: string, icon: string) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
        ${active ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
        <span>{icon}</span>{label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 min-h-screen flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">MiniLearning</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navLink('/dashboard', 'Payout Requests', '💳')}
          {navLink('/courses', 'Courses', '📚')}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-red-400 text-sm font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.email}</p>
              <p className="text-slate-500 text-xs">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-xs font-medium text-slate-400 hover:text-white border border-slate-700
              hover:border-slate-500 px-3 py-2 rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}