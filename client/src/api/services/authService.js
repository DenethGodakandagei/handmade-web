import api from '../axiosClient';

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  becomeSeller: (data) => api.put('/auth/becomeseller', data),
  getMe: () => api.get('/auth/me'),
  updateDetails: (details) => api.put('/auth/updatedetails', details),
  updateProfilePicture: (formData) => api.put('/auth/updateprofilepicture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllApplications: () => api.get('/auth/applications'),
  approveApplication: (id) => api.put(`/auth/applications/${id}/approve`),
  rejectApplication: (id) => api.put(`/auth/applications/${id}/reject`),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
