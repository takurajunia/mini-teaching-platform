import { useState, useEffect } from 'react';
import { enrollmentService } from '../../api/enrollmentService';
import type { Enrollment } from '../../api/enrollmentService';
import { sessionService } from '../../api/sessionService';
import type { Session } from '../../api/sessionService';
import Badge from '../../components/shared/Badge';

const statusVariant = (status: string) => {
  if (status === 'completed') return 'green';
  if (status === 'paid') return 'blue';
  return 'yellow';
};

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Record<string, Session[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    enrollmentService.getMyEnrollments()
      .then(setEnrollments)
      .finally(() => setLoading(false));
  }, []);

  const toggleCourse = async (courseId: string) => {
    if (expanded === courseId) { setExpanded(null); return; }
    setExpanded(courseId);
    if (!sessions[courseId]) {
      const data = await sessionService.getByCourse(courseId);
      setSessions((prev) => ({ ...prev, [courseId]: data }));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full"/>
    </div>
  );

  return (
    <div>
      <div className="mb-10">
        <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">Learning</p>
        <h1 className="text-4xl font-bold text-slate-900">My Courses</h1>
        <p className="text-slate-500 mt-2">{enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-4">🎓</p>
          <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleCourse(enrollment.course_id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-lg">📚</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">{enrollment.title}</h2>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{enrollment.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className="text-xl font-bold text-slate-900">${enrollment.price}</span>
                  <span className={`text-slate-400 transition-transform duration-200 ${expanded === enrollment.course_id ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </div>

              {expanded === enrollment.course_id && (
                <div className="border-t border-slate-100 p-6 bg-slate-50">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Sessions</h3>
                  {!sessions[enrollment.course_id] ? (
                    <p className="text-sm text-slate-400">Loading sessions...</p>
                  ) : sessions[enrollment.course_id].length === 0 ? (
                    <p className="text-sm text-slate-400">No sessions scheduled yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {sessions[enrollment.course_id].map((session) => (
                        <div key={session.id}
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{session.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(session.scheduled_at).toLocaleString()} · {session.duration_minutes} mins
                            </p>
                          </div>
                          <Badge label={session.status} variant={statusVariant(session.status)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}