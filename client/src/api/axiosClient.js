// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Request Interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response Interceptor
// api.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error.response ? error.response.data : error);
//   }
// );

// export default api;







import axios from 'axios';

// 1. Setup the Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. Request Interceptor (Handles Token injection automatically)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (Handles global errors and data unwrapping)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

// 4. Chat API Functions 
// Notice we use 'api' instead of 'axios' now, so we don't need to pass tokens manually.
// export const startChat = async (artisanId, productId) => {
//   const res = await api.post('/chat/start', { artisanId, productId });
//   return res.data; // Note: Interceptor already returned res.data, so this might just be 'res' depending on your backend structure
// };

// export const getMessages = async (chatId) => {
//   const res = await api.get(`/chat/${chatId}/messages`);
//   return res.data;
// };

// export const sendMessageApi = (chatId, content) => {
//   return api.post('/chat/message', { chatId, content });
// };


// API Functions
export const startChat = (artisanId, productId) => api.post('/chat/start', { artisanId, productId });
export const getMessages = (chatId) => api.get(`/chat/${chatId}/messages`);
export const sendMessageApi = (chatId, content) => api.post('/chat/message', { chatId, content });

export default api;
