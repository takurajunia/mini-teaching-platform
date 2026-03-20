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
};