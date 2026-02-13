import { create } from 'zustand';
import authService from '../api/services/authService';

const getUserFromStorage = () => {
  try {
    const item = localStorage.getItem('user');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to parse user from storage', error);
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!getUserFromStorage(),
  loading: false,
  error: null,
  
  // Auth Modal State
  isAuthModalOpen: false,
  authModalView: 'login', // 'login' or 'register'
  
  openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authModalView: view }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  toggleAuthModalView: () => set((state) => ({ authModalView: state.authModalView === 'login' ? 'register' : 'login' })),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      const { token, data } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data || response.user));
      
      set({ 
        user: data || response.user, 
        token, 
        isAuthenticated: true, 
        loading: false 
      });
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Login failed', 
        loading: false 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      const { token, data } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));
      
      set({ 
        user: data, 
        token, 
        isAuthenticated: true, 
        loading: false 
      });
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Registration failed', 
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
