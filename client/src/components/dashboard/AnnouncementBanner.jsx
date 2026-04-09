import React, { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import announcementService from '@/api/services/announcementService';

const PRIORITY_STYLES = {
  urgent: {
    bg: 'bg-red-600',
    text: 'text-white',
    icon: AlertTriangle,
    badge: 'bg-red-100 text-red-700 border-red-200'
  },
  normal: {
    bg: 'bg-blue-600',
    text: 'text-white',
    icon: Megaphone,
    badge: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  low: {
    bg: 'bg-emerald-600',
    text: 'text-white',
    icon: Info,
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
};
const CARD_HEIGHT = 60;
const EXPANDED_GAP = 45;

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementService.getActive();
        setAnnouncements(res.data?.announcements || []);
      } catch {}
    };

    if (!user) {
      setAnnouncements([]);
      return;
    }

    fetchAnnouncements();
    return undefined;
  }, [user]);

  if (!announcements.length) return null;

  return (
    <div className="px-3 md:px-4 pt-1">
      <div
        className="relative z-40"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{ height: CARD_HEIGHT }}
      >
        <AnimatePresence initial={false}>
          {announcements.map((announcement, index) => {
            const style = PRIORITY_STYLES[announcement.priority] || PRIORITY_STYLES.normal;
            const Icon = style.icon;
            const isTop = index === 0;
            const canInteract = isExpanded || isTop;

            return (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{
                  opacity: isTop ? 1 : isExpanded ? 1 : 0,
                  y: isExpanded ? index * EXPANDED_GAP : 0
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  type: 'spring',
                  stiffness: 240,
                  damping: 28,
                  mass: 0.85,
                  delay: isExpanded ? index * 0.045 : 0
                }}
                style={{ zIndex: 100 - index }}
                className={`${style.bg} ${style.text} absolute left-0 right-0 rounded-none shadow-lg ring-1 ring-black/5 overflow-hidden ${
                  canInteract ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div className="w-full px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span
                        className={`inline-flex items-center justify-center w-[64px] h-5 text-[9px] font-semibold border ${style.badge}`}
                      >
                        {announcement.priority || 'normal'}
                      </span>
                      <span className="text-[10px] font-bold flex-shrink-0">{announcement.title}</span>
                      <span className="text-xs opacity-90 truncate">{announcement.body}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
