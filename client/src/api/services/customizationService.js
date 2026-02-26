import api from '../axiosClient';

const customizationService = {
    create: (data) => api.post('/customizations', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: (params) => api.get('/customizations', { params }),
    updateStatus: (id, payload) => {
        // payload can be '{ status: "Accepted", price: 100 }'
        const data = typeof payload === 'string' ? { status: payload } : payload;
        return api.put(`/customizations/${id}/status`, data);
    },
};

export default customizationService;
