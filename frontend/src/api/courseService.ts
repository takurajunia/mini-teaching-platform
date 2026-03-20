import apiClient from './client';

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  price: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export const courseService = {
  listPublished: async () => {
    const res = await apiClient.get<{ data: Course[] }>('/courses');
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<{ data: Course }>(`/courses/${id}`);
    return res.data.data;
  },

  getMyCourses: async () => {
    const res = await apiClient.get<{ data: Course[] }>('/courses/instructor/my-courses');
    return res.data.data;
  },

  create: async (data: { title: string; description: string; price: number }) => {
    const res = await apiClient.post<{ data: Course }>('/courses', data);
    return res.data.data;
  },

  edit: async (id: string, data: Partial<{ title: string; description: string; price: number }>) => {
    const res = await apiClient.patch<{ data: Course }>(`/courses/${id}`, data);
    return res.data.data;
  },

  publish: async (id: string) => {
    const res = await apiClient.post<{ data: Course }>(`/courses/${id}/publish`);
    return res.data.data;
  },

  unpublish: async (id: string) => {
    const res = await apiClient.post<{ data: Course }>(`/courses/${id}/unpublish`);
    return res.data.data;
  },
};