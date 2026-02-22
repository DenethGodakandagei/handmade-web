import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ShoppingBag, Star, Package, AlertTriangle, Calendar, DollarSign, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/ext/profile/${id}`);
        setData(res.data);
      } catch { toast.error('Failed to load profile'); navigate('/admin/users'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [id]);

  if (loading || !data) return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;

  const { user, stats, orders, reviews, products, timeline } = data;
  const riskColors = { low: 'text-green-600 bg-green-50 border-green-200', medium: 'text-yellow-600 bg-yellow-50 border-yellow-200', high: 'text-red-600 bg-red-50 border-red-200' };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Card */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-200 p-8 bg-white flex flex-col md:flex-row gap-8">
        <div className="w-20 h-20 bg-black text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" alt="" /> : user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <span className="text-[9px] uppercase tracking-widest font-bold bg-gray-100 border border-gray-200 px-2 py-0.5">{user.role}</span>
            {user.isSeller && <span className="text-[9px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5">Seller</span>}
            <span className={`text-[9px] uppercase tracking-widest font-bold border px-2 py-0.5 ${riskColors[stats.riskLevel]}`}>Risk: {stats.riskLevel} ({stats.riskScore}%)</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            {user.studioName && <span>🏛️ {user.studioName}</span>}
            {user.location && <span>📍 {user.location}</span>}
            {user.telephone && <span>📞 {user.telephone}</span>}
            <span>📅 Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          {user.bio && <p className="text-xs text-gray-500 mt-3 line-clamp-2">{user.bio}</p>}
        </div>
      </motion.section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Spent', value: `$${stats.totalSpent}`, icon: DollarSign, color: 'text-green-500' },
          { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
          { label: 'Avg Order', value: `$${stats.avgOrderValue}`, icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Reviews', value: stats.totalReviews, icon: Star, color: 'text-yellow-500' },
          { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-orange-500' }
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-2 mb-1"><s.icon className={`w-3 h-3 ${s.color}`} /><span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">{s.label}</span></div>
            <p className="text-2xl font-light tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <section className="border border-gray-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Recent Orders</h3></div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto scrollbar-thin">
            {orders.map(o => (
              <div key={o._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-bold">#{String(o._id).slice(-6)}</p>
                  <p className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">${o.totalAmount}</p>
                  <span className={`text-[8px] uppercase tracking-widest font-bold ${o.status === 'Delivered' ? 'text-green-500' : o.status === 'Cancelled' ? 'text-red-500' : 'text-yellow-500'}`}>{o.status}</span>
                </div>
              </div>
            ))}
            {!orders.length && <p className="p-5 text-sm text-gray-300 italic">No orders</p>}
          </div>
        </section>

        {/* Reviews */}
        <section className="border border-gray-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Reviews Written</h3></div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto scrollbar-thin">
            {reviews.map(r => (
              <div key={r._id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">{r.title}</p>
                  <span className="text-[10px] font-bold text-yellow-600">{r.rating}★</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">on {r.product?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.text}</p>
              </div>
            ))}
            {!reviews.length && <p className="p-5 text-sm text-gray-300 italic">No reviews</p>}
          </div>
        </section>
      </div>

      {/* Activity Timeline */}
      <section className="border border-gray-200 p-6 bg-white">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Activity Timeline</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {(timeline || []).map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 ${event.type === 'order' ? 'bg-blue-50 text-blue-500' : 'bg-yellow-50 text-yellow-500'}`}>
                {event.type === 'order' ? <ShoppingBag className="w-3 h-3" /> : <Star className="w-3 h-3" />}
              </div>
              <div className="flex-1">
                {event.type === 'order' ? (
                  <p className="text-xs">Placed order <span className="font-mono font-bold">#{String(event.data.id).slice(-6)}</span> for <span className="font-bold">${event.data.amount}</span> — <span className={`font-bold ${event.data.status === 'Delivered' ? 'text-green-500' : event.data.status === 'Cancelled' ? 'text-red-500' : ''}`}>{event.data.status}</span></p>
                ) : (
                  <p className="text-xs">Reviewed <span className="font-bold">{event.data.product}</span> — "{event.data.title}" <span className="text-yellow-600 font-bold">{event.data.rating}★</span></p>
                )}
                <p className="text-[9px] text-gray-300 font-mono mt-0.5">{new Date(event.date).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {(!timeline?.length) && <p className="text-sm text-gray-300 italic">No activity</p>}
        </div>
      </section>
    </div>
  );
};

export default AdminUserProfile;
