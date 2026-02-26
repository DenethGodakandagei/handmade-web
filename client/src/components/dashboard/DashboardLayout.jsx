
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import CommandPalette from './CommandPalette';
import NotificationBell from './NotificationBell';
import { Command, Search } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import AnnouncementBanner from './AnnouncementBanner';

const DashboardLayout = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="flex h-screen bg-white">
            <DashboardSidebar />

            <div className="flex-1 md:ml-64 overflow-y-auto w-full">
                {/* Announcement banners — visible to ALL users */}
                <AnnouncementBanner />

                {/* Admin top bar with notification bell and ⌘K hint */}
                {isAdmin && (
                    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-12">
                        <div className="flex items-center justify-end gap-4 h-12 max-w-7xl mx-auto">
                            <button
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                                className="flex items-center gap-2 text-gray-300 hover:text-gray-500 transition-colors bg-gray-50 border border-gray-100 px-3 py-1.5 rounded"
                            >
                                <Search className="w-3 h-3" />
                                <span className="text-[10px] tracking-wide">Search</span>
                                <kbd className="text-[9px] font-mono bg-white border border-gray-200 px-1 py-0.5 rounded flex items-center gap-0.5">
                                    <Command className="w-2.5 h-2.5" />K
                                </kbd>
                            </button>
                            <NotificationBell />
                        </div>
                    </div>
                )}

                <main className="min-h-screen pt-4 pb-8 px-6 md:px-12 relative max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>

            {/* Global Command Palette */}
            {isAdmin && <CommandPalette />}
        </div>
    );
};

export default DashboardLayout;
