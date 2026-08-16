import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('dhakshu_user') || 'null'),
  token: localStorage.getItem('dhakshu_token') || null,
  isAuthenticated: !!localStorage.getItem('dhakshu_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success) {
        const { accessToken, user } = response.data;
        localStorage.setItem('dhakshu_token', accessToken);
        localStorage.setItem('dhakshu_user', JSON.stringify(user));
        set({ user, token: accessToken, isAuthenticated: true, loading: false });
        return { success: true, user };
      }
      set({ error: response.message, loading: false });
      return { success: false, message: response.message };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.message };
    }
  },

  register: async (fullName, email, password, phone) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { fullName, email, password, phone });
      if (response.success) {
        const { accessToken, user } = response.data;
        localStorage.setItem('dhakshu_token', accessToken);
        localStorage.setItem('dhakshu_user', JSON.stringify(user));
        set({ user, token: accessToken, isAuthenticated: true, loading: false });
        return { success: true, user };
      }
      set({ error: response.message, loading: false });
      return { success: false, message: response.message };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('dhakshu_token');
    localStorage.removeItem('dhakshu_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    if (!get().token) return;
    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        localStorage.setItem('dhakshu_user', JSON.stringify(response.data));
        set({ user: response.data, isAuthenticated: true });
      }
    } catch (e) {
      get().logout();
    }
  }
}));
