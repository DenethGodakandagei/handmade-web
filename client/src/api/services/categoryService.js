import api from '../axiosClient';

const categoryService = {
  getAll: () => api.get('/categories'),
};

export default categoryService;
