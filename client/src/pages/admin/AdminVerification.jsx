import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, RefreshCcw, Check, X, Clock, CheckCircle2, XCircle, MapPin, Briefcase, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminVerification = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ext/verification');
      setData(res.data);
    } catch { toast.error('Failed to load verification queue'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, action) => {
    const label = action === 'approve' ? 'Approve' : 'Reject';
    if (action === 'reject' && !window.confirm(`${label} this application?`)) return;
    try {
      await api.put(`/admin/ext/verification/${id}`, { action, notes: notes[id] || '' });
      toast.success(`Application ${action}d`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  if (loading && !data) return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Artisan Verification</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Review & Approve Seller Applications</p>
        </div>
        <Button onClick={fetchData} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </header>

      <section className="grid grid-cols-3 gap-6">
        {[
          { label: 'Pending', value: data?.summary?.pending || 0, icon: Clock, color: 'border-yellow-200 bg-yellow-50/20' },
          { label: 'Approved', value: data?.summary?.approved || 0, icon: CheckCircle2, color: 'border-green-200 bg-green-50/20' },
          { label: 'Rejected', value: data?.summary?.rejected || 0, icon: XCircle, color: 'border-red-200 bg-red-50/20' }
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className={`border ${s.color} p-5 space-y-2`}>
            <div className="flex items-center gap-2"><s.icon className="w-3.5 h-3.5 text-gray-400" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">{s.label}</span></div>
            <p className="text-4xl font-light tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </section>

      {/* Pending Applications */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Pending Review</h3>
        <div className="space-y-4">
          {(data?.pending || []).map(user => (
            <motion.div key={user._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-yellow-200 bg-white overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-black text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" alt="" /> : user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-black">{user.name}</h4>
                    <p className="text-xs text-gray-400">{user.email}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {user.studioName && <div className="flex items-center gap-2"><Briefcase className="w-3 h-3 text-gray-300" /><span className="text-xs text-gray-600">{user.studioName}</span></div>}
                      {user.location && <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-gray-300" /><span className="text-xs text-gray-600">{user.location}</span></div>}
                      {user.category && <div className="flex items-center gap-2"><Palette className="w-3 h-3 text-gray-300" /><span className="text-xs text-gray-600">{user.category}</span></div>}
                      {user.experience && <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-gray-300" /><span className="text-xs text-gray-600">{user.experience} exp</span></div>}
                    </div>

                    {user.bio && <p className="text-xs text-gray-500 mt-3 line-clamp-2">{user.bio}</p>}
                    {user.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {user.skills.map(s => <span key={s} className="text-[9px] uppercase tracking-widest font-bold text-gray-500 bg-gray-100 px-2 py-0.5">{s}</span>)}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4">
                      <input type="text" placeholder="Notes (optional)" value={notes[user._id] || ''} onChange={e => setNotes(prev => ({ ...prev, [user._id]: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black" />
                      <button onClick={() => handleAction(user._id, 'approve')} className="bg-green-600 text-white px-5 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-green-700 flex items-center gap-1.5"><Check size={12} /> Approve</button>
                      <button onClick={() => handleAction(user._id, 'reject')} className="bg-red-600 text-white px-5 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-red-700 flex items-center gap-1.5"><X size={12} /> Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {(!data?.pending?.length) && <div className="border border-gray-200 p-12 text-center text-sm text-gray-400 italic">No pending applications</div>}
        </div>
      </section>

      {/* Recently Approved */}
      {data?.approved?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Recently Approved</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.approved.map(u => (
              <div key={u._id} className="border border-green-200 p-4 bg-green-50/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{u.name?.[0]}</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.studioName || u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminVerification;
