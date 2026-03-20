import { useState, useEffect } from 'react';
import { courseService } from '../../api/courseService';
import type { Course } from '../../api/courseService';
import { enrollmentService } from '../../api/enrollmentService';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';

export default function StudentDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCourses, myEnrollments] = await Promise.all([
          courseService.listPublished(),
          enrollmentService.getMyEnrollments(),
        ]);
        setCourses(allCourses);
        setEnrolledIds(new Set(myEnrollments.map((e) => e.course_id)));
      } catch {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await enrollmentService.enroll(courseId);
      setEnrolledIds((prev) => new Set([...prev, courseId]));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full"/>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">Discover</p>
        <h1 className="text-4xl font-bold text-slate-900">Browse Courses</h1>
        <p className="text-slate-500 mt-2">{courses.length} courses available to enroll</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-slate-500">No published courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden
                hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col">
              {/* Card Header */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full -translate-y-8 translate-x-8"/>
                <Badge label="Published" variant="yellow" />
                <h2 className="font-bold text-white text-lg mt-3 leading-snug">{course.title}</h2>
              </div>
              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-3">
                  {course.description}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">${course.price}</span>
                  {enrolledIds.has(course.id) ? (
                    <Button variant="secondary" size="sm" disabled>
                      ✓ Enrolled
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      loading={enrolling === course.id}
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}