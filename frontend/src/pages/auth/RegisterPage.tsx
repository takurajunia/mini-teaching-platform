import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '', type: 'student' as 'student' | 'instructor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await authService.register(form.email, form.password, form.type);
      setAuth(user, token);
      if (user.type === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
            <span className="text-slate-900 font-bold">E</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">MiniLearning</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Start your<br />
            <span className="text-amber-400">learning journey</span><br />
            today.
          </h1>
          <p className="text-slate-400 text-lg">
            Whether you're here to learn or to teach, MiniLearning gives you the tools to grow.
          </p>
        </div>
        <div className="flex gap-6">
          {(['Student', 'Instructor'] as const).map((t) => (
            <div key={t} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${form.type === t.toLowerCase()
                ? 'border-amber-400 bg-amber-400/10'
                : 'border-slate-700 bg-slate-800'}`}
              onClick={() => setForm({ ...form, type: t.toLowerCase() as 'student' | 'instructor' })}>
              <p className="text-2xl mb-1">{t === 'Student' ? '🎓' : '👨‍🏫'}</p>
              <p className={`font-semibold text-sm ${form.type === t.toLowerCase() ? 'text-amber-400' : 'text-slate-300'}`}>
                {t}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Create account</h2>
            <p className="text-slate-500 mt-2">Join MiniLearning for free today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {/* Role selector — visible on mobile too */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                I want to
              </label>
              <div className="flex gap-3">
                {(['student', 'instructor'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                      ${form.type === t
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                    {t === 'student' ? '🎓 Learn' : '👨‍🏫 Teach'}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              Create Account →
            </Button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}