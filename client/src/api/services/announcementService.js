import api from '../axiosClient';

const announcementService = {
  getAdmin: (params = {}) => api.get('/admin/ext/announcements', { params }),
  create: (payload) => api.post('/admin/ext/announcements', payload),
  update: (id, payload) => api.put(`/admin/ext/announcements/${id}`, payload),
  toggle: (id) => api.put(`/admin/ext/announcements/${id}/toggle`),
  delete: (id) => api.delete(`/admin/ext/announcements/${id}`),
  getActive: () => api.get('/announcements/active', { params: { t: Date.now() } })
};

export default announcementService;
