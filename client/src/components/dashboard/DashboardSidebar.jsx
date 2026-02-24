
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Store, Settings, LogOut, MessageSquare, Hammer } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const DashboardSidebar = () => {
    const { logout } = useAuthStore();
    
    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/dashboard/products' },
        { icon: ShoppingBag, label: 'Orders', path: '/dashboard/orders' },
        { icon: Hammer, label: 'Customizations', path: '/dashboard/customizations' },
        { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages' },
        { icon: Store, label: 'Storefront', path: '/dashboard/storefront' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <aside className="w-64 border-r border-gray-100 min-h-screen bg-white hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 pt-12 pb-12">
            <div className="px-10 mb-16">
                <NavLink to="/" className="block">
                    <h1 className="text-2xl font-medium tracking-tighter text-black hover:opacity-50 transition-opacity">
                    ARTISAN.
                    </h1>
                </NavLink>
            </div>
            
            <div className="flex-1 px-6 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) => `
                            group flex items-center gap-4 px-4 py-3 rounded-md text-sm transition-all duration-300 relative
                            ${isActive 
                                ? 'text-black font-medium bg-gray-50' 
                                : 'text-gray-500 hover:text-black hover:bg-gray-50/50'
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-black rounded-r-full" />
                                )}
                                <item.icon strokeWidth={1.5} className={`w-4 h-4 transition-colors ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'}`} />
                                <span className="tracking-wide">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <div className="px-6 border-t border-gray-100 pt-8">
                <button 
                    onClick={logout}
                    className="group flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium text-gray-400 hover:text-red-600 transition-colors w-full"
                >
                    <LogOut strokeWidth={1.5} className="w-4 h-4 group-hover:stroke-red-600 transition-colors" />
                    <span className="tracking-wide">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
