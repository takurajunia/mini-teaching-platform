import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await authService.login(form.email, form.password);
      if (user.role !== 'admin') { setError('Access denied: admin accounts only'); return; }
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">MiniLearning Admin</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Platform<br /><span className="text-red-400">Control</span><br />Centre.
          </h1>
          <p className="text-slate-400 text-lg">Manage payouts, monitor courses, and oversee platform operations.</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Restricted Access</p>
          <p className="text-slate-300 text-sm">This portal is for administrators only.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Admin Sign In</h2>
            <p className="text-slate-500 mt-2">Enter your admin credentials</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
              <input type="email"
                className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
              <input type="password"
                className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg
                transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}