import api from '../axiosClient';

const customizationService = {
    create: (data) => api.post('/customizations', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: (params) => api.get('/customizations', { params }),
    updateStatus: (id, status) => api.put(`/customizations/${id}/status`, { status }),
};

export default customizationService;
