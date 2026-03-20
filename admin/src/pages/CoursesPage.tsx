import { useState, useEffect } from 'react';
import { courseService } from '../api/courseService';
import type { Course } from '../api/courseService';
import Badge from '../components/Badge';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    courseService.listPublished()
      .then(setCourses)
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Published Courses</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No published courses found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Title</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Description</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Price</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{course.title}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {course.description}
                  </td>
                  <td className="px-6 py-4 font-semibold text-indigo-600">
                    ${course.price}
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={course.status} variant="green" />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}