import api from '../axiosClient';

const messageService = {
    getAllContacts: async () => {
        const response = await api.get('/messages/contacts');
        return response;
    },
    getChats: async () => {
        const response = await api.get('/messages/chats');
        return response;
    },
    getMessages: async (userId) => {
        const response = await api.get(`/messages/${userId}`);
        return response;
    },
    sendMessage: async (userId, data) => {
        const response = await api.post(`/messages/send/${userId}`, data);
        return response;
    }
};

export default messageService;
