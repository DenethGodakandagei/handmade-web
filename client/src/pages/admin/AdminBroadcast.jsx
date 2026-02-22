import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, RefreshCcw, Plus, Trash2, Eye, EyeOff, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AUDIENCES = [
  { value: 'all', label: 'Everyone', desc: 'All registered users' },
  { value: 'buyers', label: 'Buyers Only', desc: 'Customers with user role' },
  { value: 'artisans', label: 'Artisans Only', desc: 'Verified artisan sellers' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-600 border-red-200' }
];

const AdminBroadcast = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', priority: 'normal' });
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ext/announcements');
      setAnnouncements(res.data?.announcements || []);
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) return toast.error('Title and body are required');
    setSending(true);
    try {
      const res = await api.post('/admin/ext/announcements', form);
      toast.success(`Broadcast sent to ${res.data?.affectedCount || 0} users`);
      setForm({ title: '', body: '', audience: 'all', priority: 'normal' });
      setCreating(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/admin/ext/announcements/${id}/toggle`);
      toast.success('Toggled');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/admin/ext/announcements/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  if (loading && !announcements.length) return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Announcements</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Broadcast Messages to Your Platform Users</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setCreating(!creating)} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
            <Plus size={14} className="mr-2" /> New Broadcast
          </Button>
        </div>
      </header>

      {creating && (
        <motion.section initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 p-8 bg-white space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Megaphone className="w-4 h-4" /> Compose Broadcast</h3>

          <input type="text" placeholder="Announcement title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black" />

          <textarea placeholder="Message body — supports plain text" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black resize-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Audience</p>
              <div className="flex gap-2">
                {AUDIENCES.map(a => (
                  <button key={a.value} onClick={() => setForm(p => ({ ...p, audience: a.value }))} className={`flex-1 p-3 border text-center transition-colors ${form.audience === a.value ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}>
                    <p className="text-[10px] uppercase tracking-widest font-bold">{a.label}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Priority</p>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p.value} onClick={() => setForm(prev => ({ ...prev, priority: p.value }))} className={`flex-1 py-3 border text-[10px] uppercase tracking-widest font-bold transition-colors ${form.priority === p.value ? 'bg-black text-white border-black' : p.color}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setCreating(false)} className="px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold border border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={sending} className="px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold bg-black text-white hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
              <Send size={12} /> {sending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </motion.section>
      )}

      <section className="space-y-4">
        {announcements.map((ann, i) => (
          <motion.div key={ann._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`border p-6 bg-white ${ann.active ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-sm font-bold">{ann.title}</h4>
                  <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 border ${ann.priority === 'urgent' ? 'text-red-600 bg-red-50 border-red-200' : ann.priority === 'normal' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>{ann.priority}</span>
                  <span className="text-[8px] uppercase tracking-widest font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5">{ann.audience}</span>
                </div>
                <p className="text-xs text-gray-500">{ann.body}</p>
                <p className="text-[9px] text-gray-300 mt-2 font-mono">by {ann.createdBy?.name || 'Admin'} · {new Date(ann.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(ann._id)} className={`p-2 border ${ann.active ? 'border-green-200 text-green-500' : 'border-gray-200 text-gray-300'} hover:bg-gray-50`}>
                  {ann.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(ann._id)} className="p-2 border border-red-200 text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
        {!announcements.length && <div className="border border-gray-200 p-12 text-center text-sm text-gray-400 italic">No announcements yet. Create your first broadcast above.</div>}
      </section>
    </div>
  );
};

export default AdminBroadcast;
