import { useState, useEffect } from 'react';
import { courseService } from '../../api/courseService';
import type { Course } from '../../api/courseService';
import { sessionService } from '../../api/sessionService';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Input from '../../components/shared/Input';

interface SessionForm {
  title: string;
  scheduled_at: string;
  duration_minutes: number;
}

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: 0 });
  const [sessionForm, setSessionForm] = useState<SessionForm>({
    title: '', scheduled_at: '', duration_minutes: 60,
  });

  useEffect(() => {
    courseService.getMyCourses()
      .then(setCourses)
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const course = await courseService.create(courseForm);
      setCourses((prev) => [course, ...prev]);
      setShowCreateForm(false);
      setCourseForm({ title: '', description: '', price: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const updated = course.status === 'published'
        ? await courseService.unpublish(course.id)
        : await courseService.publish(course.id);
      setCourses((prev) => prev.map((c) => c.id === course.id ? updated : c));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course');
    }
  };

  const handleCreateSession = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    try {
      await sessionService.create(courseId, sessionForm);
      setShowSessionForm(null);
      setSessionForm({ title: '', scheduled_at: '', duration_minutes: 60 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full"/>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">Teaching</p>
          <h1 className="text-4xl font-bold text-slate-900">My Courses</h1>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="lg">
          {showCreateForm ? '✕ Cancel' : '+ New Course'}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8">
          <h2 className="font-bold text-slate-800 text-lg mb-6">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="flex flex-col gap-5">
            <Input label="Course Title" value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-white text-slate-800
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                rows={3}
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                required
              />
            </div>
            <Input label="Price ($)" type="number" min={0} step={0.01} value={courseForm.price}
              onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) })} required />
            <Button type="submit" loading={creating} size="lg">Create Course</Button>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-slate-500">No courses yet. Create your first one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-start justify-between p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-lg">📖</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-slate-900">{course.title}</h2>
                      <Badge label={course.status} variant={course.status === 'published' ? 'green' : 'yellow'} />
                    </div>
                    <p className="text-sm text-slate-500">{course.description}</p>
                    <p className="text-amber-600 font-bold mt-2">${course.price}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Button
                    variant={course.status === 'published' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => handleTogglePublish(course)}
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="secondary" size="sm"
                    onClick={() => setShowSessionForm(showSessionForm === course.id ? null : course.id)}>
                    + Session
                  </Button>
                </div>
              </div>

              {showSessionForm === course.id && (
                <form onSubmit={(e) => handleCreateSession(e, course.id)}
                  className="border-t border-slate-100 p-6 bg-slate-50 flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">New Session</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Session Title" value={sessionForm.title}
                      onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} required />
                    <Input label="Scheduled At" type="datetime-local" value={sessionForm.scheduled_at}
                      onChange={(e) => setSessionForm({ ...sessionForm, scheduled_at: e.target.value })} required />
                    <Input label="Duration (mins)" type="number" min={15} value={sessionForm.duration_minutes}
                      onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) })} required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Create Session</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowSessionForm(null)}>Cancel</Button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}