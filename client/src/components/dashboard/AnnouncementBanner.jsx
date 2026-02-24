import React, { useState, useEffect } from 'react';
import { X, Megaphone, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axiosClient';
import useAuthStore from '@/store/authStore';

const PRIORITY_STYLES = {
  urgent: { bg: 'bg-red-600', text: 'text-white', icon: AlertTriangle },
  normal: { bg: 'bg-black', text: 'text-white', icon: Megaphone },
  low: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Info },
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements/active');
        const all = res.data?.announcements || [];

        // Filter out dismissed ones (stored in localStorage)
        const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
        const visible = all.filter(a => !dismissed.includes(a._id));
        setAnnouncements(visible);
      } catch {}
    };

    if (user) fetchAnnouncements();
  }, [user]);

  const dismiss = (id) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
    dismissed.push(id);
    localStorage.setItem('dismissed_announcements', JSON.stringify(dismissed));
    setAnnouncements(prev => prev.filter(a => a._id !== id));
  };

  if (!announcements.length) return null;

  return (
    <div className="space-y-0">
      <AnimatePresence>
        {announcements.map((ann) => {
          const style = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.normal;
          const Icon = style.icon;

          return (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${style.bg} ${style.text}`}
            >
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold flex-shrink-0">{ann.title}</span>
                    <span className="text-xs opacity-80 truncate">{ann.body}</span>
                  </div>
                </div>
                <button
                  onClick={() => dismiss(ann._id)}
                  className="p-1 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBanner;
