import apiClient from './client';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  type: 'student' | 'instructor' | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  register: async (email: string, password: string, type: 'student' | 'instructor') => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', {
      email, password, type,
    });
    return res.data.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', {
      email, password,
    });
    return res.data.data;
  },

  me: async () => {
    const res = await apiClient.get<{ data: User }>('/auth/me');
    return res.data.data;
  },
};