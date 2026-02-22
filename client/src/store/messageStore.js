import { create } from 'zustand';
import { io } from 'socket.io-client';
import messageService from '../api/services/messageService';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:4000';

const useMessageStore = create((set, get) => ({
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
            const { selectedUser, messages, chats } = get();

            // If the message belongs to the currently selected chat, append it
            if (selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
                set({ messages: [...messages, newMessage] });
            }

            // TODO: Maybe update the chats list order (bring to top), but for now just refresh or we ignore.
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

            // If this is a new chat, add it to chats list if not present
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

    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] }))
}));

export default useMessageStore;
