
import React from 'react';
import { NavLink } from 'react-router-dom';

import { LayoutDashboard, Package, ShoppingBag, Store, Settings, LogOut, MessageSquare, Hammer, Activity, ShieldAlert, Database, BarChart3, Receipt, BoxSelect, SlidersHorizontal, History, Crosshair, Radio, Users, Terminal, Globe, Download, Eye, UserCheck, Megaphone, HelpCircle } from 'lucide-react';

import useAuthStore from '@/store/authStore';

const NavItem = ({ item }) => (
    <NavLink
        to={item.path}
        end={item.path === '/dashboard' || item.path === '/admin'}
        className={({ isActive }) => `
            group flex items-center gap-3.5 px-4 py-2.5 rounded-md text-[13px] transition-all duration-200 relative
            ${isActive
                ? 'text-black font-medium bg-gray-50'
                : 'text-gray-400 hover:text-black hover:bg-gray-50/50'
            }
        `}
    >
        {({ isActive }) => (
            <>
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-black rounded-r-full" />
                )}
                <item.icon strokeWidth={1.5} className={`w-[15px] h-[15px] flex-shrink-0 transition-colors ${isActive ? 'text-black' : 'text-gray-300 group-hover:text-black'}`} />
                <span className="tracking-wide">{item.label}</span>
            </>
        )}
    </NavLink>
);

const SectionLabel = ({ label }) => (
    <div className="px-4 pt-5 pb-1.5">
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-300 select-none">{label}</span>
    </div>
);

const DashboardSidebar = () => {
    const { user, logout } = useAuthStore();

    const isAdmin = user?.role === 'admin';

    // ─── Admin grouped navigation ───
    const adminNav = {
        main: [
            { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
            { icon: Package, label: 'Products', path: '/admin/products' },
            { icon: Star, label: 'Reviews', path: '/admin/reviews' },
            { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
            { icon: Store, label: 'Users', path: '/admin/users' },
            { icon: HelpCircle, label: 'FAQs', path: '/admin/faqs' },
        ],
        analytics: [
            { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
            { icon: Receipt, label: 'Transactions', path: '/admin/transactions' },
            { icon: BoxSelect, label: 'Inventory', path: '/admin/inventory' },
            { icon: Globe, label: 'Geo Map', path: '/admin/geo' },
            { icon: Download, label: 'Exports', path: '/admin/exports' },
        ],
        infrastructure: [
            { icon: Activity, label: 'System Heart', path: '/admin/system' },
            { icon: Database, label: 'Database Core', path: '/admin/database' },
            { icon: Radio, label: 'Traffic Monitor', path: '/admin/traffic' },
            { icon: Terminal, label: 'Runtime', path: '/admin/runtime' },
        ],
        security: [
            { icon: ShieldAlert, label: 'Security Protocol', path: '/admin/security' },
            { icon: Crosshair, label: 'Threat Intel', path: '/admin/threats' },
            { icon: Users, label: 'Sessions', path: '/admin/sessions' },
            { icon: History, label: 'Audit Trail', path: '/admin/audit' },
            { icon: Eye, label: 'Moderation', path: '/admin/moderation' },
            { icon: UserCheck, label: 'Verification', path: '/admin/verification' },
        ],
        settings: [
            { icon: SlidersHorizontal, label: 'Platform Config', path: '/admin/config' },
            { icon: Megaphone, label: 'Broadcasts', path: '/admin/broadcast' },
        ]
    };

    // ─── Seller / User navigation ───
    const userNav = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/dashboard/products' },
        { icon: Star, label: 'Reviews', path: '/dashboard/reviews' },
        { icon: ShoppingBag, label: 'Orders', path: '/dashboard/orders' },
        { icon: Hammer, label: 'Customizations', path: '/dashboard/customizations' },
        { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages' },
        { icon: Store, label: 'Storefront', path: '/dashboard/storefront' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <aside className="w-64 border-r border-gray-100 min-h-screen bg-white hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40">
            {/* Logo — fixed top */}
            <div className="px-8 pt-8 pb-6 flex-shrink-0">
                <NavLink to="/" className="block">
                    <h1 className="text-xl font-semibold tracking-tighter text-black hover:opacity-50 transition-opacity">
                        ARTISAN<span className="text-gray-300">.</span>
                    </h1>
                    {isAdmin && (
                        <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-gray-300 mt-0.5 block">Admin Console</span>
                    )}
                </NavLink>
            </div>

            {/* Scrollable nav area */}
            <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin">
                {isAdmin ? (
                    <>
                        {/* Main */}
                        <div className="space-y-0.5">
                            {adminNav.main.map(item => <NavItem key={item.path} item={item} />)}
                        </div>

                        <SectionLabel label="Analytics & Commerce" />
                        <div className="space-y-0.5">
                            {adminNav.analytics.map(item => <NavItem key={item.path} item={item} />)}
                        </div>

                        <SectionLabel label="Infrastructure" />
                        <div className="space-y-0.5">
                            {adminNav.infrastructure.map(item => <NavItem key={item.path} item={item} />)}
                        </div>

                        <SectionLabel label="Security" />
                        <div className="space-y-0.5">
                            {adminNav.security.map(item => <NavItem key={item.path} item={item} />)}
                        </div>

                        <SectionLabel label="Configuration" />
                        <div className="space-y-0.5">
                            {adminNav.settings.map(item => <NavItem key={item.path} item={item} />)}
                        </div>
                    </>
                ) : (
                    <div className="space-y-0.5">
                        {userNav.map(item => <NavItem key={item.path} item={item} />)}
                    </div>
                )}
            </div>

            {/* Sign Out — sticky bottom */}
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
                <button
                    onClick={logout}
                    className="group flex items-center gap-3.5 px-4 py-2.5 rounded-md text-[13px] text-gray-400 hover:text-red-500 transition-colors w-full"
                >
                    <LogOut strokeWidth={1.5} className="w-[15px] h-[15px] group-hover:stroke-red-500 transition-colors" />
                    <span className="tracking-wide">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
