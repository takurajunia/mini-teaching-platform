import apiClient from './client';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  type: null;
  created_at: string;
  updated_at: string;
}

export const authService = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ data: { user: AdminUser; token: string } }>(
      '/auth/login', { email, password }
    );
    return res.data.data;
  },
};