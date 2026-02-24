import api from '../axiosClient';

const reviewService = {
    // Get all reviews (admin)
    getAll: () => api.get('/reviews'),

    // Get reviews for a specific product
    getByProduct: (productId) => api.get(`/products/${productId}/reviews`),

    // Get single review
    getById: (id) => api.get(`/reviews/${id}`),

    // Create a review for a product
    create: (productId, data) => api.post(`/products/${productId}/reviews`, data),

    // Update a review
    update: (id, data) => api.put(`/reviews/${id}`, data),

    // Delete a review
    delete: (id) => api.delete(`/reviews/${id}`),

    // Reply to a review (Artisan/Admin)
    reply: (id, data) => api.post(`/reviews/${id}/reply`, data),
};

export default reviewService;
