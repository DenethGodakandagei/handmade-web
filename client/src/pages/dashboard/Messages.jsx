import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, X, MoreVertical, Paperclip, MessageSquare, ArrowLeft } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import useMessageStore from '../../store/messageStore';
import useAuthStore from '../../store/authStore';

const Messages = () => {
    const { user } = useAuthStore();
    const { 
        contacts, chats, messages, selectedUser, 
        loadingUsers, loadingMessages, sendingMessage,
        getContactsAndChats, getMessages, sendMessage, setSelectedUser,
        connectSocket, disconnectSocket, onlineUsers
    } = useMessageStore();

    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'
    const [searchTerm, setSearchTerm] = useState('');
    const [textInput, setTextInput] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [showMobileList, setShowMobileList] = useState(true); // Toggle between list and chat on small screens
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        getContactsAndChats();
        connectSocket();
        
        return () => {
            disconnectSocket();
        }
    }, [connectSocket, disconnectSocket, getContactsAndChats]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle user selection logic specifically for mobile view
    const handleUserSelect = (u) => {
        setSelectedUser(u);
        setShowMobileList(false); // Hide directory to show chat window
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!textInput.trim() && !imagePreview) || sendingMessage) return;

        await sendMessage(textInput.trim(), imagePreview);
        setTextInput('');
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImagePreview(reader.result);
        };
    };

    const displayedUsers = activeTab === 'chats' ? chats : contacts;
    
    // Safety check filtering
    const filteredUsers = Array.isArray(displayedUsers) 
        ? displayedUsers.filter(u => 
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-100px)] max-h-[calc(100vh-100px)]">
            {/* Header hidden on small screens when viewing chat for more space */}
            <div className={`${!showMobileList ? 'hidden lg:block' : 'block'}`}>
                <DashboardHeader title="Messages" subtitle="Connect directly with artisans and customers" />
            </div>
            
            <div className={`mt-4 lg:mt-8 flex flex-1 overflow-hidden bg-white border border-gray-100 rounded-xl lg:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5`}>
                
                {/* Left Sidebar - Users List - Responsive visibility */}
                <div className={`${showMobileList ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 border-r border-gray-100 flex-col bg-gray-50/50`}>
                    
                    {/* Sidebar Header & Search */}
                    <div className="p-4 lg:p-6 border-b border-gray-100 space-y-4 lg:space-y-5">
                        <div className="flex bg-gray-200/50 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('chats')}
                                className={`flex-1 flex items-center justify-center py-2 text-xs font-semibold uppercase tracking-widest transition-all rounded-lg ${activeTab === 'chats' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                            >
                                Chats
                            </button>
                            <button 
                                onClick={() => setActiveTab('contacts')}
                                className={`flex-1 flex items-center justify-center py-2 text-xs font-semibold uppercase tracking-widest transition-all rounded-lg ${activeTab === 'contacts' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                            >
                                Directory
                            </button>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loadingUsers ? (
                            <div className="flex justify-center p-12"><Spinner /></div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center p-12 text-gray-400 text-xs font-medium uppercase tracking-widest">
                                No {activeTab} found
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100/50">
                                {filteredUsers.map((u) => {
                                    const isSelected = selectedUser?._id === u._id;
                                    const isOnline = onlineUsers.includes(u._id);
                                    return (
                                        <li key={u._id}>
                                            <button 
                                                onClick={() => handleUserSelect(u)}
                                                className={`w-full text-left p-4 lg:p-5 flex items-center space-x-4 transition-all hover:bg-white group ${isSelected ? 'bg-white border-l-2 border-black' : 'border-l-2 border-transparent'}`}
                                            >
                                                <div className="relative">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-colors ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}`}>
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    {isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-black' : 'text-gray-900'}`}>{u.name}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Area - Chat Window - Responsive visibility */}
                <div className={`${!showMobileList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-white overflow-hidden relative`}>
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 text-center bg-gray-50/30">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                                <MessageSquare size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-light text-black mb-3">Your Conversations</h3>
                            <p className="text-gray-500 max-w-sm text-sm">
                                Select someone from the sidebar to view your message history or start a new conversation.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 lg:h-20 px-4 lg:px-8 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                                <div className="flex items-center space-x-3 lg:space-x-4">
                                    {/* Mobile Back Button */}
                                    <button 
                                        onClick={() => setShowMobileList(true)}
                                        className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-50 transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    
                                     <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black flex items-center justify-center text-white flex-shrink-0 text-sm shadow-md">
                                        {selectedUser.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-base lg:text-lg text-black leading-tight">{selectedUser.name}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                             <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(selectedUser._id) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                             <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-widest font-bold">
                                                 {onlineUsers.includes(selectedUser._id) ? 'Active Now' : 'Offline'}
                                             </p>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 lg:p-2.5 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors rounded-full">
                                    <MoreVertical size={18} className="lg:w-5 lg:h-5" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6 bg-gray-50/50">
                                {loadingMessages ? (
                                    <div className="flex justify-center flex-1 items-center h-full"><Spinner /></div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                         <div className="text-center px-6 py-5 lg:px-8 lg:py-6 rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black/5 mx-4">
                                            <p className="text-sm font-semibold text-black mb-1">Start the conversation</p>
                                            <p className="text-xs text-gray-500">Send a message to break the ice.</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId === user?._id;
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                key={msg._id || idx} 
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex flex-col max-w-[85%] lg:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 lg:px-5 py-2.5 lg:py-3.5 rounded-2xl ${
                                                        isMe 
                                                        ? 'bg-black text-white rounded-br-sm shadow-md shadow-black/10' 
                                                        : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-sm'
                                                    }`}>
                                                        {msg.image && (
                                                            <div className="mb-2 lg:mb-3 rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/20">
                                                                <img 
                                                                    src={msg.image} 
                                                                    alt="Attachment" 
                                                                    className="max-w-full h-auto object-cover max-h-48 lg:max-h-64" 
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        )}
                                                        {msg.text && <p className={`text-[14px] lg:text-[15px] leading-relaxed break-words ${isMe ? 'font-light tracking-wide' : 'font-normal'}`}>{msg.text}</p>}
                                                    </div>
                                                    <span className="text-[9px] lg:text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1.5 lg:mt-2 px-1">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-3 lg:p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgb(0,0,0,0.02)]">
                                <AnimatePresence>
                                    {imagePreview && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: 10, height: 0 }}
                                            className="mb-3 lg:mb-4 relative inline-block"
                                        >
                                            <div className="relative p-2 bg-gray-50 border border-gray-200 rounded-xl inline-flex items-center gap-3">
                                                 <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                 </div>
                                                 <div className="flex flex-col pr-8 text-left text-[10px] lg:text-xs">
                                                     <span className="font-semibold text-black">Image attached</span>
                                                     <span className="text-gray-500 line-clamp-1">{fileInputRef.current?.files?.[0]?.name || 'image.jpg'}</span>
                                                 </div>
                                                <button 
                                                    onClick={() => setImagePreview(null)}
                                                    className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1 lg:p-1.5 shadow-sm transition-colors"
                                                >
                                                    <X size={12} className="lg:w-[14px] lg:h-[14px]" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                <form onSubmit={handleSend} className="flex items-end space-x-2 lg:space-x-3">
                                    <div className="flex-1 bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-xl lg:rounded-2xl flex items-center px-3 lg:px-4 py-2 lg:py-2.5 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black/20 transition-all">
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1.5 lg:p-2 -ml-1 lg:-ml-2 mr-1 lg:mr-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-200/50 focus:outline-none"
                                        >
                                            <Paperclip size={18} className="lg:w-5 lg:h-5" strokeWidth={1.5} />
                                        </button>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                        />
                                        <input 
                                            type="text" 
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder="Message..." 
                                            className="flex-1 bg-transparent border-none py-1 lg:py-1.5 outline-none text-black placeholder-gray-400 text-sm lg:text-[15px] font-medium"
                                            disabled={sendingMessage}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={(!textInput.trim() && !imagePreview) || sendingMessage}
                                        className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-200 ${
                                            (!textInput.trim() && !imagePreview) || sendingMessage
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-black text-white hover:bg-gray-900 shadow-lg shadow-black/20 active:scale-95'
                                        }`}
                                    >
                                        {sendingMessage ? <Spinner className="w-4 h-4 lg:w-5 lg:h-5 text-white" /> : <Send size={18} className="lg:w-5 lg:h-5 ml-0.5 lg:ml-1" strokeWidth={1.5} />}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </motion.div>
    );
};

export default Messages;
