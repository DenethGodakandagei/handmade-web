import api from '../axiosClient';

const messageService = {
    // ----- Legacy user-to-user DM endpoints -----
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
    },

    // ----- Chat-room endpoints (/api/v1/chat) -----
    getMyChats: async () => {
        const response = await api.get('/chat');
        return response;
    },
    getChatMessages: async (chatId) => {
        const response = await api.get(`/chat/${chatId}/messages`);
        return response;
    },
    sendChatMessage: async (chatId, content) => {
        const response = await api.post('/chat/message', { chatId, content });
        return response;
    },
    editChatMessage: async (messageId, content) => {
        const response = await api.put(`/chat/message/${messageId}`, { content });
        return response;
    },
    deleteChatMessage: async (messageId) => {
        const response = await api.delete(`/chat/message/${messageId}`);
        return response;
    },
};

export default messageService;
