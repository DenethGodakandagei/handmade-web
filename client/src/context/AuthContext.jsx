import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import authService from '../api/services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: true, // Start with loading true to check storage
  error: null,
  isAuthModalOpen: false,
  authModalView: 'login',
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        token: null,
        loading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'OPEN_MODAL':
      return { ...state, isAuthModalOpen: true, authModalView: action.payload || 'login' };
    case 'CLOSE_MODAL':
      return { ...state, isAuthModalOpen: false };
    case 'TOGGLE_MODAL_VIEW':
      return { ...state, authModalView: state.authModalView === 'login' ? 'register' : 'login' };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize from storage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: parsedUser, token } });
          
          // Verify token with backend
          const response = await authService.getMe();
          const currentUser = response.data || response;
          localStorage.setItem('user', JSON.stringify(currentUser));
          dispatch({ type: 'UPDATE_USER', payload: currentUser });
        } catch (error) {
          console.error('Auth initialization failed', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_FAILURE', payload: null });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login({ email, password });
      const { token } = response;
      localStorage.setItem('token', token);

      let userData = response.data || response.user || null;
      if (!userData) {
        const meResponse = await authService.getMe();
        userData = meResponse.data || meResponse;
      }

      localStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: userData, token } });
      return true;
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.response?.data?.message || error.message || 'Login failed' 
      });
      return false;
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.register(userData);
      const { token } = response;
      localStorage.setItem('token', token);

      let user = response.data || response.user || null;
      if (!user) {
        const meResponse = await authService.getMe();
        user = meResponse.data || meResponse;
      }

      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      return true;
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.response?.data?.message || error.message || 'Registration failed' 
      });
      return false;
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const response = await authService.getMe();
      const currentUser = response.data || response;
      localStorage.setItem('user', JSON.stringify(currentUser));
      dispatch({ type: 'UPDATE_USER', payload: currentUser });
      return currentUser;
    } catch (error) {
      console.error('Fetch me failed', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const openAuthModal = useCallback((view) => dispatch({ type: 'OPEN_MODAL', payload: view }), []);
  const closeAuthModal = useCallback(() => dispatch({ type: 'CLOSE_MODAL' }), []);
  const toggleAuthModalView = useCallback(() => dispatch({ type: 'TOGGLE_MODAL_VIEW' }), []);
  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
  const updateUser = useCallback((user) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    fetchMe,
    openAuthModal,
    closeAuthModal,
    toggleAuthModalView,
    clearError,
    updateUser,
  }), [state, login, register, logout, fetchMe, openAuthModal, closeAuthModal, toggleAuthModalView, clearError, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
