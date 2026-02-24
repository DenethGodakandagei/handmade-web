import api from '../axiosClient';

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  becomeSeller: (data) => api.put('/auth/becomeseller', data),
  getMe: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
