import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ShoppingBag, Settings,
  LogOut, ChevronLeft, ChevronRight, Hammer,
  ShieldCheck, ArrowLeft, Package, User, Database,
  Sparkles, Zap, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '../store/authStore';

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const artisanMenu = [
    { name: 'Workshop Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Heritage archives', path: '/dashboard/products', icon: Package },
    { name: 'Patron Reviews', path: '/dashboard/reviews', icon: MessageSquare },
    { name: 'Succession orders', path: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Bespoke Requests', path: '/dashboard/customizations', icon: Sparkles },
    { name: 'Master Identity', path: '/account', icon: User },
    { name: 'Core Tuning', path: '/dashboard/settings', icon: Settings },
  ];

  const adminMenu = [
    { name: 'Security Core', path: '/admin', icon: ShieldCheck },
    { name: 'Identity Index', path: '/admin/users', icon: Users },
    { name: 'Archive Control', path: '/admin/products', icon: Database },
    { name: 'Review Vault', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Pulse Log', path: '/admin/orders', icon: Zap },
    { name: 'System Heart', path: '/admin/settings', icon: Settings },
  ];

  const currentMenu = role === 'admin' ? adminMenu : artisanMenu;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 100 : 320 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="h-[calc(100vh-2rem)] bg-white m-4 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col justify-between border border-gray-100 sticky top-4 z-40 overflow-hidden"
    >
      {/* Brand Header */}
      <div className="p-10 flex items-center justify-between border-b border-gray-50/50">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center space-x-4"
            >
              <div className="bg-primary p-2.5 rounded-2xl text-white shadow-xl shadow-primary/20">
                <Hammer size={18} />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">
                {role === 'admin' ? 'Archive.' : 'Workshop.'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-400 group"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-10 px-6 space-y-3">
        <Link to="/" className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-black mb-8 group transition-all rounded-3xl hover:bg-gray-50/50">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Exit</span>}
        </Link>

        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex items-center px-6 py-5 transition-all relative group rounded-3xl
                ${isActive ? 'bg-black text-white shadow-2xl shadow-black/20' : 'text-gray-400 hover:text-black hover:bg-gray-50/50'}
              `}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary' : ''} />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-5 text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-6 px-5 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-all rounded-2xl shadow-2xl">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-6 border-t border-gray-50/50">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center px-6 py-5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-[2rem] group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          {!collapsed && <span className="ml-5 text-[10px] font-black uppercase tracking-[0.4em]">Retreat</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
