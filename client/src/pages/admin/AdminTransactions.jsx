import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, RefreshCcw, ChevronLeft, ChevronRight, DollarSign, CreditCard, Clock, CheckCircle2, XCircle, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const STATUS_CONFIG = {
  Pending: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
  Processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package },
  Shipped: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck },
  Delivered: { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 },
  Cancelled: { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle }
};

const AdminTransactions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 25 });
      if (filterStatus) params.set('status', filterStatus);
      const res = await api.get(`/admin/transactions?${params}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [page, filterStatus]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  const { transactions, pagination, summary } = data || {};

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Transaction Ledger</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Complete Financial Record — Every Payment Traced</p>
        </div>
        <Button onClick={fetchTransactions} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Ledger
        </Button>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 p-6 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Gross Revenue</span>
          </div>
          <p className="text-3xl font-light tracking-tighter">${summary?.totalRevenue?.toFixed(2) || '0.00'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-gray-200 p-6 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Total Transactions</span>
          </div>
          <p className="text-3xl font-light tracking-tighter">{summary?.totalOrders || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border border-gray-200 p-6 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Avg. Transaction</span>
          </div>
          <p className="text-3xl font-light tracking-tighter">${summary?.avgOrderValue?.toFixed(2) || '0.00'}</p>
        </motion.div>
      </section>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Filter:</span>
        {['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 border transition-colors ${filterStatus === s ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Order ID</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Customer</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Items</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Amount</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Status</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Date</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Destination</th>
              </tr>
            </thead>
            <tbody>
              {(transactions || []).map(tx => {
                const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.Pending;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={tx._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-xs font-mono font-bold text-gray-700">{tx._id?.slice(-8).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-black">{tx.user?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400">{tx.user?.email}</p>
                    </td>
                    <td className="p-4 text-xs text-gray-600">{tx.products?.length || 0} items</td>
                    <td className="p-4 text-sm font-bold font-mono">${tx.totalAmount?.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 border ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-gray-500 font-mono">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-4 text-[10px] text-gray-500 uppercase tracking-widest">{tx.shippingAddress?.country || '—'}</td>
                  </tr>
                );
              })}
              {(!transactions || transactions.length === 0) && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-400 italic">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              Page {pagination.page} of {pagination.pages} — {pagination.total} records
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages} className="p-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default AdminTransactions;
