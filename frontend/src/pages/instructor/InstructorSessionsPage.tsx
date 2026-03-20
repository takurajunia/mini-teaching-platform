import { useState, useEffect } from 'react';
import { sessionService } from '../../api/sessionService';
import type { Session } from '../../api/sessionService';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';

const statusVariant = (status: string) => {
  if (status === 'completed') return 'green';
  if (status === 'paid') return 'blue';
  return 'yellow';
};

export default function InstructorSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    sessionService.getMySessions()
      .then(setSessions)
      .catch(() => setError('Failed to load sessions'))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (sessionId: string) => {
    setCompleting(sessionId);
    try {
      const updated = await sessionService.complete(sessionId);
      setSessions((prev) => prev.map((s) => s.id === sessionId ? updated : s));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete session');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full"/>
    </div>
  );

  const upcoming = sessions.filter(s => s.status === 'scheduled');
  const completed = sessions.filter(s => s.status !== 'scheduled');

  return (
    <div>
      <div className="mb-10">
        <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">Schedule</p>
        <h1 className="text-4xl font-bold text-slate-900">My Sessions</h1>
        <p className="text-slate-500 mt-2">{upcoming.length} upcoming · {completed.length} completed</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">⚠️ {error}</div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-4">🗓️</p>
          <p className="text-slate-500">No sessions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <div key={session.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${session.status === 'scheduled' ? 'bg-amber-50' : 'bg-slate-100'}`}>
                  <span className="text-xl">{session.status === 'scheduled' ? '⏳' : session.status === 'paid' ? '✅' : '🎯'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{session.title}</h2>
                    <Badge label={session.status} variant={statusVariant(session.status)} />
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {new Date(session.scheduled_at).toLocaleString()} · {session.duration_minutes} mins
                  </p>
                </div>
              </div>
              {session.status === 'scheduled' && (
                <Button size="sm" loading={completing === session.id}
                  onClick={() => handleComplete(session.id)}>
                  Mark Complete
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}