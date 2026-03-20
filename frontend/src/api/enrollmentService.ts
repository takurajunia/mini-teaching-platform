import apiClient from './client';

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  title: string;
  description: string;
  price: number;
  status: string;
  instructor_id: string;
}

export const enrollmentService = {
  enroll: async (courseId: string) => {
    const res = await apiClient.post<{ data: Enrollment }>(`/courses/${courseId}/enroll`);
    return res.data.data;
  },

  getMyEnrollments: async () => {
    const res = await apiClient.get<{ data: Enrollment[] }>('/me/enrollments');
    return res.data.data;
  },
};