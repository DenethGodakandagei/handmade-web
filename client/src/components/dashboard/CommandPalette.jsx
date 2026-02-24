import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Package, ShoppingBag, ArrowRight, Command, LayoutDashboard, BarChart3, ShieldAlert, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axiosClient';

const PAGES = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, group: 'Navigate' },
  { label: 'Products', path: '/admin/products', icon: Package, group: 'Navigate' },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, group: 'Navigate' },
  { label: 'Users', path: '/admin/users', icon: User, group: 'Navigate' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, group: 'Navigate' },
  { label: 'Transactions', path: '/admin/transactions', icon: ShoppingBag, group: 'Navigate' },
  { label: 'Inventory', path: '/admin/inventory', icon: Package, group: 'Navigate' },
  { label: 'Threat Intel', path: '/admin/threats', icon: ShieldAlert, group: 'Navigate' },
  { label: 'Traffic Monitor', path: '/admin/traffic', icon: BarChart3, group: 'Navigate' },
  { label: 'Sessions', path: '/admin/sessions', icon: User, group: 'Navigate' },
  { label: 'Runtime', path: '/admin/runtime', icon: Settings, group: 'Navigate' },
  { label: 'Platform Config', path: '/admin/config', icon: Settings, group: 'Navigate' },
  { label: 'Audit Trail', path: '/admin/audit', icon: ShieldAlert, group: 'Navigate' },
  { label: 'Moderation', path: '/admin/moderation', icon: ShieldAlert, group: 'Navigate' },
  { label: 'Verification', path: '/admin/verification', icon: User, group: 'Navigate' },
  { label: 'Broadcasts', path: '/admin/broadcast', icon: Settings, group: 'Navigate' },
  { label: 'Exports', path: '/admin/exports', icon: Package, group: 'Navigate' },
  { label: 'Geo Map', path: '/admin/geo', icon: BarChart3, group: 'Navigate' },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ pages: [], users: [], products: [], orders: [] });
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // Keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ pages: [], users: [], products: [], orders: [] });
      setSelected(0);
    }
  }, [open]);

  // Search
  useEffect(() => {
    if (!query.trim()) {
      // Show page navigation when no query
      const filtered = PAGES.filter(p => true);
      setResults({ pages: filtered, users: [], products: [], orders: [] });
      setSelected(0);
      return;
    }

    // Filter pages locally
    const filteredPages = PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));

    // Debounce API search
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await api.get(`/admin/ext/search?q=${encodeURIComponent(query)}`);
          setResults({
            pages: filteredPages,
            users: res.data?.users || [],
            products: res.data?.products || [],
            orders: res.data?.orders || []
          });
        } catch {
          setResults({ pages: filteredPages, users: [], products: [], orders: [] });
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ pages: filteredPages, users: [], products: [], orders: [] });
      }
      setSelected(0);
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Flatten all results for keyboard navigation
  const allItems = [
    ...results.pages.map(p => ({ type: 'page', ...p })),
    ...results.users.map(u => ({ type: 'user', label: u.name, sub: u.email, path: `/admin/users`, id: u._id })),
    ...results.products.map(p => ({ type: 'product', label: p.name, sub: `$${p.price} · ${p.stock} in stock`, path: `/admin/products`, id: p._id })),
    ...results.orders.map(o => ({ type: 'order', label: `Order #${String(o._id).slice(-6)}`, sub: `$${o.totalAmount} · ${o.status}`, path: `/admin/orders`, id: o._id })),
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allItems[selected]) {
      e.preventDefault();
      navigate(allItems[selected].path);
      setOpen(false);
    }
  };

  const handleSelect = (item) => {
    navigate(item.path);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
        onClick={() => setOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white border border-gray-200 shadow-2xl shadow-black/20 overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search users, products, orders, or navigate..."
              className="flex-1 text-sm outline-none placeholder:text-gray-300 bg-transparent"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 text-[9px] text-gray-300 bg-gray-50 border border-gray-100 px-1.5 py-0.5 font-mono">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            {loading && (
              <div className="px-5 py-3 text-[10px] uppercase tracking-widest text-gray-300 font-bold">Searching...</div>
            )}

            {/* Pages */}
            {results.pages.length > 0 && (
              <div>
                <div className="px-5 pt-3 pb-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-300">Pages</div>
                {results.pages.slice(0, 8).map((page, i) => {
                  const idx = i;
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => handleSelect(page)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${selected === idx ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${selected === idx ? 'text-white' : 'text-gray-300'}`} />
                      <span className="text-sm flex-1">{page.label}</span>
                      <ArrowRight className={`w-3 h-3 ${selected === idx ? 'text-white/50' : 'text-gray-200'}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Users */}
            {results.users.length > 0 && (
              <div>
                <div className="px-5 pt-3 pb-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-300">Users</div>
                {results.users.map((user, i) => {
                  const idx = results.pages.slice(0, 8).length + i;
                  return (
                    <button
                      key={user._id}
                      onClick={() => handleSelect({ path: '/admin/users' })}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${selected === idx ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <User className={`w-3.5 h-3.5 flex-shrink-0 ${selected === idx ? 'text-white' : 'text-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className={`text-[10px] truncate ${selected === idx ? 'text-white/60' : 'text-gray-400'}`}>{user.email} · {user.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div>
                <div className="px-5 pt-3 pb-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-300">Products</div>
                {results.products.map((product, i) => {
                  const idx = results.pages.slice(0, 8).length + results.users.length + i;
                  return (
                    <button
                      key={product._id}
                      onClick={() => handleSelect({ path: '/admin/products' })}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${selected === idx ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Package className={`w-3.5 h-3.5 flex-shrink-0 ${selected === idx ? 'text-white' : 'text-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className={`text-[10px] truncate ${selected === idx ? 'text-white/60' : 'text-gray-400'}`}>${product.price} · {product.stock} in stock</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Orders */}
            {results.orders.length > 0 && (
              <div>
                <div className="px-5 pt-3 pb-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-300">Orders</div>
                {results.orders.map((order, i) => {
                  const idx = results.pages.slice(0, 8).length + results.users.length + results.products.length + i;
                  return (
                    <button
                      key={order._id}
                      onClick={() => handleSelect({ path: '/admin/orders' })}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${selected === idx ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <ShoppingBag className={`w-3.5 h-3.5 flex-shrink-0 ${selected === idx ? 'text-white' : 'text-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">#{String(order._id).slice(-6)}</p>
                        <p className={`text-[10px] ${selected === idx ? 'text-white/60' : 'text-gray-400'}`}>${order.totalAmount} · {order.status}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {allItems.length === 0 && !loading && (
              <div className="px-5 py-8 text-center text-sm text-gray-300">No results found</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 text-[9px] text-gray-300 uppercase tracking-widest font-bold">
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 border border-gray-200 px-1 py-0.5 font-mono">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 border border-gray-200 px-1 py-0.5 font-mono">↵</kbd> Select</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-300">
              <Command className="w-2.5 h-2.5" />K to toggle
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
