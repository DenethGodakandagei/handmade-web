import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Send, X, MoreVertical, MessageSquare, ArrowLeft,
    Edit2, Trash2, Reply, Check, Package
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import useMessageStore from '../../store/messageStore';
import useAuthStore from '../../store/authStore';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDay = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getOtherParty = (chat, userId) => {
    if (!chat) return null;
    return chat.artisan?._id === userId ? chat.customer : chat.artisan;
};

// ─── Message Context Menu ───────────────────────────────────────────────────

const MessageMenu = ({ onEdit, onDelete, onReply, isOwn }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -4 }}
        transition={{ duration: 0.12 }}
        className={`absolute top-0 z-30 bg-white border border-gray-100 rounded-xl shadow-lg shadow-black/10 py-1 min-w-[130px] ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}`}
    >
        <button
            onClick={onReply}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
            <Reply size={14} className="text-gray-400" /> Reply
        </button>
        {isOwn && (
            <>
                <button
                    onClick={onEdit}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Edit2 size={14} className="text-gray-400" /> Edit
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={14} /> Delete
                </button>
            </>
        )}
    </motion.div>
);

// ─── Single Message Row ─────────────────────────────────────────────────────

const MessageRow = ({ msg, isOwn, onEdit, onDelete, onReply, replyPreview }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        if (menuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`flex group ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`relative flex flex-col max-w-[80%] lg:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Context menu trigger */}
                <div className={`absolute top-1 z-20 ${isOwn ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'}`} ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="p-1.5 rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                        {menuOpen && (
                            <MessageMenu
                                isOwn={isOwn}
                                onEdit={() => { onEdit(msg); setMenuOpen(false); }}
                                onDelete={() => { onDelete(msg._id); setMenuOpen(false); }}
                                onReply={() => { onReply(msg); setMenuOpen(false); }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Reply preview */}
                {replyPreview && (
                    <div className={`mb-1 px-3 py-1.5 rounded-lg border-l-2 border-gray-400 bg-gray-100 text-xs text-gray-500 max-w-full truncate`}>
                        ↩ {replyPreview}
                    </div>
                )}

                {/* Bubble */}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isOwn
                        ? 'bg-black text-white rounded-br-sm shadow-md shadow-black/10'
                        : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-sm'
                }`}>
                    {msg.content}
                    {msg.isEdited && (
                        <span className="ml-1.5 text-[10px] opacity-50">(edited)</span>
                    )}
                </div>

                {/* Time */}
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1 px-1">
                    {formatTime(msg.createdAt)}
                </span>
            </div>
        </motion.div>
    );
};

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

const DeleteDialog = ({ onConfirm, onCancel }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
        >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-center text-black mb-1">Delete message?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                >
                    Delete
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

const Messages = () => {
    const { user } = useAuthStore();
    const {
        chatList, selectedChat, chatMessages,
        loadingChats, loadingChatMessages, sendingChatMessage,
        fetchMyChats, selectChat, sendChatMessage,
        editChatMessage, deleteChatMessage,
        editingMessageId, setEditingMessageId,
    } = useMessageStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [textInput, setTextInput] = useState('');
    const [replyTo, setReplyTo] = useState(null); // { _id, content }
    const [editText, setEditText] = useState('');
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [showMobileList, setShowMobileList] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchMyChats();
    }, [fetchMyChats]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleChatSelect = (chat) => {
        selectChat(chat);
        setShowMobileList(false);
        setReplyTo(null);
        setEditingMessageId(null);
        setTextInput('');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!textInput.trim() || sendingChatMessage) return;

        const prefix = replyTo ? `↩ "${replyTo.content.slice(0, 50)}" \n` : '';
        await sendChatMessage(prefix + textInput.trim());
        setTextInput('');
        setReplyTo(null);
        inputRef.current?.focus();
    };

    const handleStartEdit = (msg) => {
        setEditingMessageId(msg._id);
        setEditText(msg.content);
    };

    const handleSaveEdit = async (messageId) => {
        if (!editText.trim()) return;
        await editChatMessage(messageId, editText.trim());
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTargetId) return;
        await deleteChatMessage(deleteTargetId);
        setDeleteTargetId(null);
    };

    const filteredChats = chatList.filter(chat => {
        const other = getOtherParty(chat, user?._id);
        return (
            other?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <>
            <AnimatePresence>
                {deleteTargetId && (
                    <DeleteDialog
                        onConfirm={handleDeleteConfirm}
                        onCancel={() => setDeleteTargetId(null)}
                    />
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-100px)] max-h-[calc(100vh-100px)]">
                {/* Header — hidden on mobile while in chat view */}
                <div className={`${!showMobileList ? 'hidden lg:block' : 'block'}`}>
                    <DashboardHeader title="Messages" subtitle="Your conversations with artisans and customers" />
                </div>

                <div className="mt-4 lg:mt-8 flex flex-1 overflow-hidden bg-white border border-gray-100 rounded-xl lg:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">

                    {/* ── Left Sidebar ──────────────────────────────────── */}
                    <div className={`${showMobileList ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 border-r border-gray-100 flex-col bg-gray-50/50`}>

                        {/* Search */}
                        <div className="p-4 lg:p-5 border-b border-gray-100 space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Chats</h2>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={15} />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingChats ? (
                                <div className="flex justify-center p-12"><Spinner /></div>
                            ) : filteredChats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-10 text-center text-gray-400">
                                    <MessageSquare size={32} strokeWidth={1} className="mb-3 text-gray-300" />
                                    <p className="text-xs font-medium uppercase tracking-widest">No chats yet</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100/60">
                                    {filteredChats.map(chat => {
                                        const other = getOtherParty(chat, user?._id);
                                        const isSelected = selectedChat?._id === chat._id;
                                        return (
                                            <li key={chat._id}>
                                                <button
                                                    onClick={() => handleChatSelect(chat)}
                                                    className={`w-full text-left p-4 flex items-start gap-3 transition-all hover:bg-white ${isSelected ? 'bg-white border-l-2 border-black' : 'border-l-2 border-transparent'}`}
                                                >
                                                    {/* Avatar */}
                                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0 ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                        {other?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <p className={`text-sm font-semibold truncate ${isSelected ? 'text-black' : 'text-gray-900'}`}>{other?.name ?? 'Unknown'}</p>
                                                            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{formatDay(chat.updatedAt)}</span>
                                                        </div>
                                                        {/* Product badge */}
                                                        {chat.product?.name && (
                                                            <div className="flex items-center gap-1 mb-0.5">
                                                                <Package size={10} className="text-gray-400" />
                                                                <span className="text-[10px] text-gray-400 truncate">{chat.product.name}</span>
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-gray-400 truncate">{chat.lastMessage || 'Start the conversation'}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* ── Right Panel — Chat ────────────────────────────── */}
                    <div className={`${!showMobileList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-white overflow-hidden relative`}>
                        {!selectedChat ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-sm">
                                    <MessageSquare size={30} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-light text-black mb-2">Your Conversations</h3>
                                <p className="text-gray-400 max-w-xs text-sm">Select a chat from the sidebar to view messages.</p>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <div className="h-16 lg:h-18 px-4 lg:px-6 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowMobileList(true)}
                                            className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-black rounded-full hover:bg-gray-50 transition-colors"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-sm font-semibold shadow">
                                            {getOtherParty(selectedChat, user?._id)?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm lg:text-base text-black leading-tight">
                                                {getOtherParty(selectedChat, user?._id)?.name}
                                            </h4>
                                            {selectedChat.product?.name && (
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Package size={9} /> {selectedChat.product.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 bg-gray-50/40">
                                    {loadingChatMessages ? (
                                        <div className="flex justify-center items-center h-full"><Spinner /></div>
                                    ) : chatMessages.length === 0 ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center px-6 py-5 rounded-2xl border border-gray-100 bg-white shadow-sm mx-4">
                                                <p className="text-sm font-semibold text-black mb-1">No messages yet</p>
                                                <p className="text-xs text-gray-500">Send a message to start the conversation.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg) => {
                                            const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                                            const isEditing = editingMessageId === msg._id;

                                            if (isEditing) {
                                                return (
                                                    <motion.div
                                                        key={msg._id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex justify-end"
                                                    >
                                                        <div className="flex flex-col items-end max-w-[80%] lg:max-w-[65%] gap-1.5">
                                                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm w-full">
                                                                <input
                                                                    autoFocus
                                                                    value={editText}
                                                                    onChange={e => setEditText(e.target.value)}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(msg._id); }
                                                                        if (e.key === 'Escape') setEditingMessageId(null);
                                                                    }}
                                                                    className="flex-1 text-sm outline-none bg-transparent text-black"
                                                                />
                                                                <button onClick={() => handleSaveEdit(msg._id)} className="p-1 rounded-full bg-black text-white hover:bg-gray-800 transition-colors">
                                                                    <Check size={12} />
                                                                </button>
                                                                <button onClick={() => setEditingMessageId(null)} className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 px-1">Press Enter to save · Esc to cancel</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }

                                            // Parse reply prefix if content starts with ↩
                                            let replyPreview = null;
                                            let displayContent = msg.content;
                                            if (msg.content?.startsWith('↩ "')) {
                                                const splitIdx = msg.content.indexOf('" \n');
                                                if (splitIdx !== -1) {
                                                    replyPreview = msg.content.slice(3, splitIdx);
                                                    displayContent = msg.content.slice(splitIdx + 3).trim();
                                                }
                                            }

                                            return (
                                                <MessageRow
                                                    key={msg._id}
                                                    msg={{ ...msg, content: displayContent }}
                                                    isOwn={isOwn}
                                                    replyPreview={replyPreview}
                                                    onEdit={handleStartEdit}
                                                    onDelete={(id) => setDeleteTargetId(id)}
                                                    onReply={(m) => setReplyTo({ _id: m._id, content: displayContent })}
                                                />
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 lg:p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgb(0,0,0,0.02)]">
                                    {/* Reply preview bar */}
                                    <AnimatePresence>
                                        {replyTo && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-2 flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500"
                                            >
                                                <Reply size={12} className="text-gray-400 flex-shrink-0" />
                                                <span className="flex-1 truncate">Replying to: "{replyTo.content.slice(0, 60)}..."</span>
                                                <button onClick={() => setReplyTo(null)} className="p-1 hover:text-black transition-colors"><X size={12} /></button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <form onSubmit={handleSend} className="flex items-center gap-2 lg:gap-3">
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-2xl flex items-center px-4 py-2.5 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black/20 transition-all">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={textInput}
                                                onChange={e => setTextInput(e.target.value)}
                                                placeholder="Message..."
                                                disabled={sendingChatMessage}
                                                className="flex-1 bg-transparent border-none outline-none text-black placeholder-gray-400 text-sm font-medium"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!textInput.trim() || sendingChatMessage}
                                            className={`p-3 lg:p-3.5 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-200 ${
                                                !textInput.trim() || sendingChatMessage
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-black text-white hover:bg-gray-900 shadow-lg shadow-black/20 active:scale-95'
                                            }`}
                                        >
                                            {sendingChatMessage ? <Spinner className="w-4 h-4 text-white" /> : <Send size={16} strokeWidth={1.5} className="ml-0.5" />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </motion.div>
        </>
    );
};

export default Messages;
