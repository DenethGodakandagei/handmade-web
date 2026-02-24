import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, ChevronDown, ChevronUp, Package, Clock,
    Truck, CheckCircle, XCircle, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import orderService from '@/api/services/orderService';
import useAuthStore from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';

// ─── Constants ──────────────────────────────────────────────────────────────
const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const FILTER_OPTIONS = ['All', ...ALL_STATUSES];

// What status transitions are allowed from each state (seller logic)
const NEXT_STATUSES = {
    Pending: ['Processing', 'Cancelled'],
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],          // terminal — no changes
    Cancelled: [],          // terminal — no changes
};

const STATUS_CONFIG = {
    Pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    Processing: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Package },
    Shipped: { label: 'Shipped', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Truck },
    Delivered: { label: 'Delivered', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    Cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: XCircle },
};

// ─── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <Icon className="w-3 h-3" strokeWidth={2} />
            {cfg.label}
        </span>
    );
};

// ─── Seller Status Updater ───────────────────────────────────────────────────
const StatusUpdater = ({ orderId, currentStatus, onUpdated }) => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const nextOptions = NEXT_STATUSES[currentStatus] || [];

    if (nextOptions.length === 0) return <StatusBadge status={currentStatus} />;

    const handleSelect = async (newStatus) => {
        setOpen(false);
        setSaving(true);
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success(`Order marked as ${newStatus}`);
            onUpdated(orderId, newStatus);
        } catch (err) {
            toast.error('Failed to update status', { description: err?.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative inline-block">
            {saving ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-sm">
                    <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Saving…
                </span>
            ) : (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-sm hover:border-black hover:bg-gray-50 transition-all"
                    >
                        <StatusBadge status={currentStatus} />
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <AnimatePresence>
                        {open && (
                            <>
                                {/* Backdrop */}
                                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 top-full mt-1.5 z-20 bg-white border border-gray-200 rounded-sm shadow-xl min-w-[170px] overflow-hidden"
                                >
                                    <p className="px-3 pt-2.5 pb-1 text-[9px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                                        Move to
                                    </p>
                                    {nextOptions.map(status => {
                                        const cfg = STATUS_CONFIG[status];
                                        const Icon = cfg.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleSelect(status)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left group"
                                            >
                                                <Icon className={`w-4 h-4 ${cfg.text}`} strokeWidth={1.5} />
                                                <span className="font-medium">{status}</span>
                                                <ChevronRight className="w-3 h-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

// ─── Order Row ───────────────────────────────────────────────────────────────
const OrderRow = ({ order, isSeller, isExpanded, onToggle, onStatusUpdate }) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
    const itemCount = order.products?.length || 0;

    return (
        <div className="border border-gray-100 rounded-sm overflow-visible hover:border-gray-200 transition-colors">

            {/* ── Row Header ── */}
            <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/60 transition-colors group"
                onClick={onToggle}
            >
                {/* Order ID */}
                <div className="hidden sm:block w-28 flex-shrink-0">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Order</p>
                    <p className="font-mono text-xs text-gray-700">#{order._id?.slice(-8).toUpperCase()}</p>
                </div>

                {/* Date */}
                <div className="hidden md:block w-28 flex-shrink-0">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Date</p>
                    <p className="text-xs text-gray-700">{date}</p>
                </div>

                {/* Items */}
                <div className="w-14 flex-shrink-0 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Items</p>
                    <p className="text-xs font-medium">{itemCount}</p>
                </div>

                {/* Customer (seller view) */}
                {isSeller && (
                    <div className="hidden lg:block flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Customer</p>
                        <p className="text-xs text-gray-700 truncate">
                            {order.user?.name || order.user?.email || '—'}
                        </p>
                    </div>
                )}

                {/* Status — seller gets interactive updater, buyer gets static badge */}
                <div className="flex-1 flex justify-start" onClick={e => isSeller && e.stopPropagation()}>
                    {isSeller ? (
                        <StatusUpdater
                            orderId={order._id}
                            currentStatus={order.status}
                            onUpdated={onStatusUpdate}
                        />
                    ) : (
                        <StatusBadge status={order.status} />
                    )}
                </div>

                {/* Total */}
                <div className="w-24 flex-shrink-0 text-right">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Total</p>
                    <p className="text-sm font-semibold text-black">${Number(order.totalAmount).toFixed(2)}</p>
                </div>

                {/* Expand icon */}
                <div className="ml-1 text-gray-300 group-hover:text-black transition-colors flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {/* ── Expanded Detail ── */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-5 space-y-5">

                            {/* Items */}
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-3">Items Ordered</p>
                                <div className="space-y-2">
                                    {order.products?.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-sm bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-black">{item.name || 'Product'}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} · ${Number(item.price).toFixed(2)} each</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-semibold">${Number(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Shipping */}
                                {order.shippingAddress && (
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Ships To</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {order.shippingAddress.address},<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.postalCode},<br />
                                            {order.shippingAddress.country}
                                        </p>
                                    </div>
                                )}

                                {/* Payment */}
                                {order.paymentResult?.id && (
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Payment</p>
                                        <p className="font-mono text-xs text-gray-500 break-all">{order.paymentResult.id}</p>
                                        <p className="text-xs text-gray-400 mt-1">Status: {order.paymentResult.status}</p>
                                    </div>
                                )}
                            </div>

                            {/* Seller: Status history / next step hint */}
                            {isSeller && NEXT_STATUSES[order.status]?.length > 0 && (
                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Next Action</p>
                                    <div className="flex flex-wrap gap-2">
                                        {NEXT_STATUSES[order.status].map(next => {
                                            const cfg = STATUS_CONFIG[next];
                                            const Icon = cfg.icon;
                                            return (
                                                <button
                                                    key={next}
                                                    onClick={async () => {
                                                        try {
                                                            await orderService.updateStatus(order._id, next);
                                                            toast.success(`Order marked as ${next}`);
                                                            onStatusUpdate(order._id, next);
                                                        } catch (e) {
                                                            toast.error('Update failed');
                                                        }
                                                    }}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-sm transition-all hover:shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-90`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                                    Mark as {next}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Filter Tab ──────────────────────────────────────────────────────────────
const FilterTab = ({ label, count, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors rounded-sm ${active ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
    >
        {label}
        {count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
            </span>
        )}
    </button>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
const Orders = () => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const isSeller = user?.role === 'artisan' || user?.role === 'admin';

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = isSeller
                ? await orderService.getAll()
                : await orderService.getMyOrders();
            // axios interceptor returns body directly: { success, data: [...] }
            const list = result?.data ?? result ?? [];
            setOrders(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err?.message || 'Failed to load orders');
            toast.error('Could not load orders');
        } finally {
            setLoading(false);
        }
    }, [isSeller]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // Optimistic status update — no need to refetch entire list
    const handleStatusUpdate = (orderId, newStatus) => {
        setOrders(prev =>
            prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
        );
    };

    const filteredOrders = activeFilter === 'All'
        ? orders
        : orders.filter(o => o.status === activeFilter);

    const countFor = s => s === 'All' ? orders.length : orders.filter(o => o.status === s).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <Spinner />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-8">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-bold">
                        {isSeller ? 'Seller Dashboard' : 'My Account'}
                    </p>
                    <h1 className="text-3xl font-light tracking-tight text-black">Orders</h1>
                    {isSeller && (
                        <p className="text-xs text-gray-400 mt-1">
                            Click the status badge on any order to update it — or expand an order for quick action buttons.
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{orders.length} total</span>
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-black border border-gray-200 hover:border-black rounded-sm transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>
            </header>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Status legend for sellers */}
            {isSeller && orders.length > 0 && (
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-sm border border-gray-100">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold self-center">Status flow:</span>
                    {ALL_STATUSES.map((s, i) => (
                        <React.Fragment key={s}>
                            <StatusBadge status={s} />
                            {i < ALL_STATUSES.length - 1 && <span className="text-gray-300 self-center text-xs">→</span>}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Filter tabs */}
            {orders.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {FILTER_OPTIONS.map(f => (
                        <FilterTab key={f} label={f} count={countFor(f)} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
                    ))}
                </div>
            )}

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-sm py-24 space-y-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                        <ShoppingBag className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-black">
                        {activeFilter === 'All' ? 'No Orders Yet' : `No ${activeFilter} Orders`}
                    </h3>
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                        {activeFilter === 'All'
                            ? isSeller ? 'Orders for your products will appear here' : 'Your placed orders will appear here'
                            : `No orders with "${activeFilter}" status`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map(order => (
                        <OrderRow
                            key={order._id}
                            order={order}
                            isSeller={isSeller}
                            isExpanded={expandedId === order._id}
                            onToggle={() => setExpandedId(p => p === order._id ? null : order._id)}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Orders;
