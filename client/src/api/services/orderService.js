import api from '../axiosClient';

const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
};

export default orderService;
