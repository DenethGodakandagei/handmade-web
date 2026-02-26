import api from '../axiosClient';

const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getArtisans: () => api.get('/users/artisans/all'),
  getArtisanById: (id) => api.get(`/users/artisans/${id}`),
};

export default userService;
