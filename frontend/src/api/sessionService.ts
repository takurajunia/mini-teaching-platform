import apiClient from './client';

export interface Session {
  id: string;
  course_id: string;
  instructor_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'paid';
  created_at: string;
  updated_at: string;
}

export const sessionService = {
  getByCourse: async (courseId: string) => {
    const res = await apiClient.get<{ data: Session[] }>(`/courses/${courseId}/sessions`);
    return res.data.data;
  },

  getMySessions: async () => {
    const res = await apiClient.get<{ data: Session[] }>('/sessions/my');
    return res.data.data;
  },

  create: async (courseId: string, data: {
    title: string;
    scheduled_at: string;
    duration_minutes: number;
  }) => {
    const res = await apiClient.post<{ data: Session }>(
      `/courses/${courseId}/sessions`, data
    );
    return res.data.data;
  },

  complete: async (id: string) => {
    const res = await apiClient.post<{ data: Session }>(`/sessions/${id}/complete`);
    return res.data.data;
  },
};