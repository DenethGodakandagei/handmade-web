import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCcw, Check, X, Package, MessageSquare, AlertTriangle, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminModeration = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('products');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ext/moderation');
      setData(res.data);
    } catch { toast.error('Failed to load moderation queue'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleModerate = async (type, id, action) => {
    const label = action === 'remove' ? 'Remove' : 'Approve';
    if (action === 'remove' && !window.confirm(`${label} this ${type}?`)) return;
    try {
      await api.put(`/admin/ext/moderation/${type}/${id}`, { action });
      toast.success(`${type} ${action}d`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  if (loading && !data) return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Content Moderation</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Review Products & Reviews Before They Go Live</p>
        </div>
        <Button onClick={fetchData} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync
        </Button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'New Products', value: data?.summary?.pendingProducts || 0, icon: Package, color: 'border-blue-200' },
          { label: 'Flagged Reviews', value: data?.summary?.flaggedReviews || 0, icon: AlertTriangle, color: 'border-red-200' },
          { label: 'Recent Reviews', value: data?.summary?.recentReviews || 0, icon: MessageSquare, color: 'border-green-200' },
          { label: 'No Images', value: data?.summary?.incompleteListings || 0, icon: ImageOff, color: 'border-yellow-200' }
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className={`border ${s.color} p-5 bg-white space-y-2`}>
            <div className="flex items-center gap-2"><s.icon className="w-3.5 h-3.5 text-gray-400" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">{s.label}</span></div>
            <p className="text-3xl font-light tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </section>

      <div className="flex gap-2">
        {[['products', 'New Products'], ['reviews', 'Flagged Reviews'], ['incomplete', 'Incomplete']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 border transition-colors ${tab === key ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}>{label}</button>
        ))}
      </div>

      {tab === 'products' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {(data?.recentProducts || []).map(p => (
            <div key={p._id} className="border border-gray-200 p-5 bg-white flex items-start gap-5">
              {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-16 h-16 object-cover border border-gray-100 flex-shrink-0" /> : <div className="w-16 h-16 bg-gray-100 flex items-center justify-center flex-shrink-0"><ImageOff className="w-4 h-4 text-gray-300" /></div>}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold">{p.name}</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">by {p.artisan?.name || 'Unknown'} · {p.category?.name || 'N/A'} · ${p.price} · {p.stock} in stock</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleModerate('product', p._id, 'approve')} className="p-2 border border-green-200 text-green-500 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                <button onClick={() => handleModerate('product', p._id, 'remove')} className="p-2 border border-red-200 text-red-500 hover:bg-red-50"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {(!data?.recentProducts?.length) && <div className="border border-gray-200 p-12 text-center text-sm text-gray-400 italic">No products pending review</div>}
        </motion.section>
      )}

      {tab === 'reviews' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {(data?.flaggedReviews || []).map(r => (
            <div key={r._id} className="border border-red-200 p-5 bg-red-50/10 flex items-start gap-5">
              <div className="w-10 h-10 bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-red-600">{r.rating}★</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold">{r.title}</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">by {r.user?.name} on {r.product?.name}</p>
                <p className="text-xs text-gray-600 mt-1">{r.text}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleModerate('review', r._id, 'approve')} className="p-2 border border-green-200 text-green-500 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                <button onClick={() => handleModerate('review', r._id, 'remove')} className="p-2 border border-red-200 text-red-500 hover:bg-red-50"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {(!data?.flaggedReviews?.length) && <div className="border border-gray-200 p-12 text-center text-sm text-gray-400 italic">No flagged reviews</div>}
        </motion.section>
      )}

      {tab === 'incomplete' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {(data?.noImageProducts || []).map(p => (
            <div key={p._id} className="border border-yellow-200 p-5 bg-yellow-50/10 flex items-center gap-5">
              <ImageOff className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-bold">{p.name}</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">by {p.artisan?.name} · ${p.price} · {p.stock} stock</p>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-1">Missing Images</span>
            </div>
          ))}
          {(!data?.noImageProducts?.length) && <div className="border border-gray-200 p-12 text-center text-sm text-gray-400 italic">All products have images</div>}
        </motion.section>
      )}
    </div>
  );
};

export default AdminModeration;
