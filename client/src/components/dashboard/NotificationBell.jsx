import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, AlertTriangle, ShoppingBag, Shield, Users, Package, Server, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../api/axiosClient';

const TYPE_ICONS = { order: ShoppingBag, security: Shield, stock: Package, user: Users, system: Server, review: AlertTriangle, verification: Users };
const SEVERITY_COLORS = { info: 'bg-blue-500', warning: 'bg-yellow-500', critical: 'bg-red-500' };

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/ext/notifications');
      setNotifications(res.data?.notifications || []);
      setUnread(res.data?.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/admin/ext/notifications/all/read');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.put(`/admin/ext/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-400 hover:text-black transition-colors">
        <Bell strokeWidth={1.5} className="w-[18px] h-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 shadow-xl shadow-black/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Notifications</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[9px] uppercase tracking-widest font-bold text-blue-500 hover:text-blue-700">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-black"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-300">No notifications yet</div>
              ) : (
                notifications.slice(0, 20).map(n => {
                  const Icon = TYPE_ICONS[n.type] || Bell;
                  return (
                    <div
                      key={n._id}
                      onClick={() => markRead(n._id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${n.read ? 'opacity-50' : 'bg-blue-50/30 hover:bg-blue-50/50'}`}
                    >
                      <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5 ${SEVERITY_COLORS[n.severity] || 'bg-gray-100'}`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-black truncate">{n.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[9px] text-gray-300 mt-1 font-mono">
                          {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
