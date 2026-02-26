import api from '../axiosClient';

const faqService = {
  getPublished: () => api.get('/faqs'),
  getAllAdmin: () => api.get('/faqs/admin'),
  getById: (id) => api.get(`/faqs/${id}`),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`)
};

export default faqService;
