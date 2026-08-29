import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare, Package } from "lucide-react";
import { connectSocket, getSocket } from "../lib/socket.js";
import { getMessages, sendMessageApi } from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = ({ chatId, token, onClose, product, sellerName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const socket = connectSocket(token);

    const onConnect = () => {
      socket.emit("joinChat", chatId);
    };
    if (socket.connected) {
      onConnect();
    } else {
      socket.on("connect", onConnect);
    }

    const handleReceive = (msg) => {
      // normalize sender to object for consistent rendering
      const normalized = {
        ...msg,
        sender: typeof msg.sender === 'string' ? { _id: msg.sender } : msg.sender
      };
      setMessages((prev) => {
        if (normalized._id && prev.some((m) => m._id === normalized._id)) return prev;
        return [...prev, normalized];
      });
    };
    socket.on("receiveMessage", handleReceive);

    getMessages(chatId)
      .then((res) => setMessages(res.data || []))
      .catch((err) => console.error("Load Error:", err));

    return () => {
      socket.off("connect", onConnect);
      socket.off("receiveMessage", handleReceive);
      // do not disconnect global socket - other components may rely on it
    };
  }, [chatId, token]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId || sending) return;
    try {
      setSending(true);
      const res = await sendMessageApi(chatId, text);
      let newMsg = res?.data;
      if (!newMsg) {
        newMsg = { chatId, content: text, sender: { _id: user?._id || "You" }, createdAt: new Date().toISOString() };
      }
      // ensure sender is object with _id for rendering logic
      if (newMsg.sender && typeof newMsg.sender !== 'object') {
        newMsg.sender = { _id: newMsg.sender };
      }
      if (!newMsg.sender) {
        newMsg.sender = { _id: user?._id || "You" };
      }
      setMessages((prev) => {
        if (newMsg._id && prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });

      setText("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Send Error:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    /* ── Backdrop ── */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Modal Panel ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5"
        style={{ height: "90vh", maxHeight: "800px" }}
      >

        {/* ── Header ── */}
        <div className="px-5 border-b border-gray-100 bg-white flex-shrink-0">
          {/* Top row */}
          <div className="h-16 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-sm font-semibold shadow flex-shrink-0">
              {sellerName?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-black leading-tight truncate">
                {sellerName ?? "Artisan"}
              </h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Artisan</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Product card */}
          {product && (
            <div className="mb-3 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Package size={18} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate leading-tight">
                  {product.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {product.price != null && (
                    <span className="text-xs font-bold text-black">
                      $ {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[200px]">
              <div className="text-center px-6 py-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <MessageSquare size={28} strokeWidth={1.2} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-black mb-1">No messages yet</p>
                <p className="text-xs text-gray-400">Send a message to start the conversation.</p>
              </div>
            </div>
          ) : (
            messages.map((m, i) => {
              // messages just added or coming from API may have sender as id or object
              const senderId = m.sender?._id || m.sender;
              const isMe = senderId && user?._id && senderId.toString() === user._id.toString();
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex flex-col max-w-[78%] ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isMe
                        ? "bg-black text-white rounded-br-sm shadow-md shadow-black/10"
                        : "bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-sm"
                    }`}>
                      {m.content}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1 px-1">
                      {formatTime(m.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {/* ── Input ── */}
        <div className="p-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center px-4 py-2.5 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black/20 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Message..."
                disabled={sending}
                className="flex-1 bg-transparent border-none outline-none text-black placeholder-gray-400 text-sm font-medium"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
                !text.trim() || sending
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-900 shadow-lg shadow-black/20 active:scale-95"
              }`}
            >
              <Send size={16} strokeWidth={1.5} className="ml-0.5" />
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default Chat;
