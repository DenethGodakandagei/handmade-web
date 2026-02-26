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

  fetchMe: async () => {
    // optional logic to re-fetch user from backend on mount?
    try {
      const response = await authService.getMe();
      // response might be { success: true, data: user }
      const currentUser = response.data || response;
      localStorage.setItem('user', JSON.stringify(currentUser));
      set({ user: currentUser });
    } catch (err) {
      console.error(err);
      // Only logout on 401? For now prevent auto-logout unless strictly 401
    }
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

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
      const { token } = response;

      localStorage.setItem('token', token);

      // The login endpoint only returns { success, token }, so we need to fetch user data
      let userData = response.data || response.user || null;

      if (!userData) {
        // Fetch user profile using the token
        const meResponse = await authService.getMe();
        userData = meResponse.data || meResponse;
      }

      localStorage.setItem('user', JSON.stringify(userData));

      set({
        user: userData,
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
      const { token } = response;

      localStorage.setItem('token', token);

      // The register endpoint only returns { success, token }, so we need to fetch user data
      let user = response.data || response.user || null;

      if (!user) {
        const meResponse = await authService.getMe();
        user = meResponse.data || meResponse;
      }

      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
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
