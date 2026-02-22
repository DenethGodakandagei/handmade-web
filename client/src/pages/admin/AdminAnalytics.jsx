import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, BarChart3, ArrowUpRight, ArrowDownRight, Package, Crown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  const { revenue, orders, users, topProducts, topArtisans } = data || {};

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <DashboardHeader title="Analytics Center" subtitle="Revenue Intelligence & Growth Metrics" />

      {/* KPI Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-green-500" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">30-Day Revenue</h3>
          </div>
          <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black">
            ${revenue?.current?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </p>
          <p className={`text-xs tracking-wide font-bold flex items-center gap-1 ${revenue?.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {revenue?.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {revenue?.growth}% vs prev. period
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">30-Day Orders</h3>
          </div>
          <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black">{orders?.current || 0}</p>
          <p className={`text-xs tracking-wide font-bold flex items-center gap-1 ${orders?.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {orders?.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {orders?.growth}% vs prev. period
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Avg. Order Value</h3>
          </div>
          <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black">${orders?.avgValue || '0.00'}</p>
          <p className="text-xs text-gray-400 tracking-wide">Per transaction average</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">New Users (30d)</h3>
          </div>
          <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black">{users?.newThisMonth || 0}</p>
          <p className={`text-xs tracking-wide font-bold flex items-center gap-1 ${users?.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {users?.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {users?.growth}% vs prev. period
          </p>
        </motion.div>
      </section>

      {/* Revenue Chart */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="border border-gray-200 p-8 bg-white">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-light tracking-tight">Revenue Trajectory (30 Days)</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">Daily gross transaction volume</p>
          </div>
          <Button onClick={fetchAnalytics} className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
            Refresh
          </Button>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue?.byDay || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af', textTransform: 'uppercase' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{ fontSize: 9, fill: '#9ca3af' }} dx={-10} />
              <RechartsTooltip
                contentStyle={{ borderRadius: '0', border: '1px solid #e5e7eb', boxShadow: 'none', fontSize: '11px' }}
                labelStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#analyticsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Order Status + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Status Breakdown */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="border border-gray-200 p-8 bg-white">
          <h3 className="text-lg font-light tracking-tight mb-1">Order Pipeline</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Status distribution across lifecycle</p>
          <div className="space-y-4">
            {(orders?.statusBreakdown || []).map(s => {
              const total = orders?.current || 1;
              const pct = ((s.count / total) * 100).toFixed(1);
              const colors = { Pending: 'bg-yellow-500', Processing: 'bg-blue-500', Shipped: 'bg-purple-500', Delivered: 'bg-green-500', Cancelled: 'bg-red-500' };
              return (
                <div key={s._id} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="uppercase tracking-widest font-bold text-gray-600">{s._id}</span>
                    <span className="font-mono font-bold">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                    <div className={`h-full ${colors[s._id] || 'bg-gray-400'}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Top Products */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="border border-gray-200 p-8 bg-white">
          <h3 className="text-lg font-light tracking-tight mb-1 flex items-center gap-2">
            <Package className="w-4 h-4 text-black" /> Top Products
          </h3>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Highest revenue generators</p>
          <div className="space-y-4">
            {(topProducts || []).map((p, i) => (
              <div key={p._id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-gray-400 w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-medium text-black truncate max-w-[200px]">{p.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono">${p.totalRevenue?.toFixed(2)}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest">{p.totalSold} sold</p>
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-sm text-gray-400 italic">No sales data yet</p>
            )}
          </div>
        </motion.section>
      </div>

      {/* Top Artisans */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="border border-gray-200 p-8 bg-white">
        <h3 className="text-lg font-light tracking-tight mb-1 flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-500" /> Top-Performing Artisans
        </h3>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Revenue contribution leaderboard</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {(topArtisans || []).map((a, i) => (
            <div key={a._id} className="border border-gray-100 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-gray-300">#{i + 1}</span>
                <span className="text-sm font-bold text-black truncate">{a.studioName || a.name}</span>
              </div>
              <p className="text-2xl font-light tracking-tighter">${a.totalRevenue?.toFixed(2)}</p>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{a.totalSold} units sold</p>
            </div>
          ))}
          {(!topArtisans || topArtisans.length === 0) && (
            <p className="text-sm text-gray-400 italic col-span-5">No artisan data yet</p>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default AdminAnalytics;
