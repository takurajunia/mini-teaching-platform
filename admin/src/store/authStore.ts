import { create } from 'zustand';
import type { AdminUser } from '../api/authService';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  setAuth: (user: AdminUser, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('admin_user')
    ? JSON.parse(localStorage.getItem('admin_user')!)
    : null,
  token: localStorage.getItem('admin_token'),

  setAuth: (user, token) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));