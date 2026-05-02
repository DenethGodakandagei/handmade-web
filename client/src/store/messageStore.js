import { create } from 'zustand';
import { io } from 'socket.io-client';
import messageService from '../api/services/messageService';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:4000';

const useMessageStore = create((set, get) => ({
    // ---- Legacy DM state (socket-based) ----
    contacts: [],
    chats: [],
    messages: [],
    selectedUser: null,
    loadingUsers: false,
    loadingMessages: false,
    sendingMessage: false,
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const { socket } = get();
        if (socket?.connected) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        newSocket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });

        newSocket.on('newMessage', (newMessage) => {
            const { selectedUser, messages } = get();
            if (selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
                set({ messages: [...messages, newMessage] });
            }
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    getContactsAndChats: async () => {
        set({ loadingUsers: true });
        try {
            const [contacts, chats] = await Promise.all([
                messageService.getAllContacts(),
                messageService.getChats()
            ]);
            set({ contacts, chats });
        } catch (error) {
            console.error('Failed to get contacts and chats:', error);
        } finally {
            set({ loadingUsers: false });
        }
    },

    getMessages: async (userId) => {
        set({ loadingMessages: true });
        try {
            const messages = await messageService.getMessages(userId);
            set({ messages });
        } catch (error) {
            console.error('Failed to get messages:', error);
        } finally {
            set({ loadingMessages: false });
        }
    },

    sendMessage: async (text, image) => {
        const { selectedUser, messages, chats } = get();
        if (!selectedUser) return;

        set({ sendingMessage: true });
        try {
            const newMessage = await messageService.sendMessage(selectedUser._id, { text, image });
            set({ messages: [...messages, newMessage] });

            if (!chats.find(c => c._id === selectedUser._id)) {
                set({ chats: [selectedUser, ...chats] });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            set({ sendingMessage: false });
        }
    },

    setSelectedUser: (user) => {
        set({ selectedUser: user });
        if (user) {
            get().getMessages(user._id);
        } else {
            set({ messages: [] });
        }
    },

    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

    // ---- Chat-room state (REST-based) ----
    chatList: [],
    selectedChat: null,
    chatMessages: [],
    loadingChats: false,
    loadingChatMessages: false,
    sendingChatMessage: false,
    editingMessageId: null,
    chatSocket: null,

    fetchMyChats: async () => {
        set({ loadingChats: true });
        try {
            const response = await messageService.getMyChats();
            const data = response?.data ?? response ?? [];
            set({ chatList: Array.isArray(data) ? data : [] });
        } catch (error) {
            console.error('Failed to fetch chats:', error);
            set({ chatList: [] });
        } finally {
            set({ loadingChats: false });
        }
    },

    selectChat: (chat) => {
        set({ selectedChat: chat, chatMessages: [] });
        if (chat) {
            get().connectChatSocket();
            get().joinChatRoom(chat._id);
            get().fetchChatMessages(chat._id);
        }
    },

    fetchChatMessages: async (chatId) => {
        set({ loadingChatMessages: true });
        try {
            const response = await messageService.getChatMessages(chatId);
            const data = response?.data ?? response ?? [];
            set({ chatMessages: Array.isArray(data) ? data : [] });
        } catch (error) {
            console.error('Failed to fetch chat messages:', error);
            set({ chatMessages: [] });
        } finally {
            set({ loadingChatMessages: false });
        }
    },

    sendChatMessage: async (content) => {
        const { selectedChat, chatMessages, chatSocket } = get();
        if (!selectedChat || !content.trim()) return;

        set({ sendingChatMessage: true });
        try {
            const response = await messageService.sendChatMessage(selectedChat._id, content);
            const newMsg = response?.data ?? response;
            set((state) => ({ 
                chatMessages: newMsg._id && state.chatMessages.some(m => m._id === newMsg._id) 
                    ? state.chatMessages 
                    : [...state.chatMessages, newMsg] 
            }));
            // Update lastMessage in the chat list
            set((state) => ({
                chatList: state.chatList.map(c =>
                    c._id === selectedChat._id ? { ...c, lastMessage: content, updatedAt: new Date().toISOString() } : c
                )
            }));
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            set({ sendingChatMessage: false });
        }
    },

    editChatMessage: async (messageId, content) => {
        const { chatMessages } = get();
        try {
            const response = await messageService.editChatMessage(messageId, content);
            const updated = response?.data ?? response;
            set({
                chatMessages: chatMessages.map(m => m._id === messageId ? { ...m, content: updated.content ?? content, isEdited: true } : m),
                editingMessageId: null
            });
        } catch (error) {
            console.error('Failed to edit message:', error);
        }
    },

    deleteChatMessage: async (messageId) => {
        const { chatMessages } = get();
        try {
            await messageService.deleteChatMessage(messageId);
            set({ chatMessages: chatMessages.filter(m => m._id !== messageId) });
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    },

    setEditingMessageId: (id) => set({ editingMessageId: id }),
    connectChatSocket: () => {
        const { chatSocket } = get();
        if (chatSocket) return; // Socket is already created (either connected or connecting)
        const token = localStorage.getItem('token');
        if (!token) return;
        const newSocket = io(SOCKET_URL, { auth: { token } });

        newSocket.on('connect', () => {
            console.log('Chat socket connected');
        });

        newSocket.on('receiveMessage', (msg) => {
            const { selectedChat, chatMessages, chatList } = get();
            const incomingChatId = msg.chatId || msg.chat;

            // Update chat list
            const chatExists = chatList.find(c => c._id === incomingChatId);
            if (!chatExists) {
                // It's a new chat, fetch all chats to get its populated details
                get().fetchMyChats();
            } else {
                // Update existing chat in list
                set({
                    chatList: chatList.map(c => 
                        c._id === incomingChatId 
                            ? { ...c, lastMessage: msg.content, updatedAt: msg.createdAt || new Date().toISOString() } 
                            : c
                    )
                });
            }

            // Update messages if this is the active chat
            if (selectedChat && incomingChatId === selectedChat._id) {
                // ignore duplicates (e.g. message originated from this client)
                if (msg._id && chatMessages.some(m => m._id === msg._id)) return;
                set({ chatMessages: [...chatMessages, msg] });
            }
        });

        newSocket.on('messageEdited', (msg) => {
            const { chatMessages } = get();
            set({
                chatMessages: chatMessages.map(m => (m._id === msg._id ? msg : m))
            });
        });

        newSocket.on('messageDeleted', ({ messageId }) => {
            const { chatMessages } = get();
            set({ chatMessages: chatMessages.filter(m => m._id !== messageId) });
        });

        set({ chatSocket: newSocket });
    },

    joinChatRoom: (chatId) => {
        const { chatSocket } = get();
        if (!chatSocket) return;
        if (chatSocket.connected) {
            chatSocket.emit('joinChat', chatId);
        } else {
            // wait until connection before joining
            const handler = () => {
                chatSocket.emit('joinChat', chatId);
                chatSocket.off('connect', handler);
            };
            chatSocket.on('connect', handler);
        }
    },

    disconnectChatSocket: () => {
        const { chatSocket } = get();
        if (chatSocket) {
            chatSocket.disconnect();
            set({ chatSocket: null });
        }
    },
}));

export default useMessageStore;
