import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCcw, Monitor, Smartphone, Tablet, Trash2, XCircle, Chrome, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const DEVICE_ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };

const AdminSessions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/security/sessions');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleKillSession = async (id) => {
    if (!window.confirm('Terminate this session?')) return;
    try {
      await api.delete(`/admin/security/sessions/${id}`);
      toast.success('Session terminated');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to terminate session');
    }
  };

  const handleKillUserSessions = async (userId, name) => {
    if (!window.confirm(`Terminate ALL sessions for ${name}?`)) return;
    try {
      await api.delete(`/admin/security/sessions/user/${userId}`);
      toast.success(`All sessions for ${name} terminated`);
      fetchSessions();
    } catch (err) {
      toast.error('Failed to terminate sessions');
    }
  };

  if (loading && !data) {
    return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Session Inspector</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Active User Connections — Device Fingerprinting & Selective Termination</p>
        </div>
        <Button onClick={fetchSessions} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-blue-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Active Sessions</span></div>
          <p className="text-4xl font-light tracking-tighter">{data?.total || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-green-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Unique Users</span></div>
          <p className="text-4xl font-light tracking-tighter">{data?.uniqueUsers || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-purple-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Multi-Session Users</span></div>
          <p className="text-4xl font-light tracking-tighter">{(data?.byUser || []).filter(u => u.count > 1).length}</p>
        </motion.div>
      </section>

      {/* Sessions by User */}
      <section className="space-y-6">
        {(data?.byUser || []).map(group => (
          <motion.div key={group.user?._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 bg-white overflow-hidden">
            {/* User header */}
            <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold">
                  {group.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-black">{group.user?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{group.user?.email} · {group.user?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{group.count} session{group.count > 1 ? 's' : ''}</span>
                {group.count > 1 && (
                  <button onClick={() => handleKillUserSessions(group.user?._id, group.user?.name)} className="text-[10px] uppercase tracking-widest font-bold bg-red-500 text-white px-3 py-1.5 hover:bg-red-600 flex items-center gap-1">
                    <XCircle size={10} /> Kill All
                  </button>
                )}
              </div>
            </div>

            {/* Individual sessions */}
            <div className="divide-y divide-gray-50">
              {group.sessions.map(session => {
                const DeviceIcon = DEVICE_ICONS[session.device] || Monitor;
                return (
                  <div key={session._id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <DeviceIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black">{session.browser}</span>
                          <span className="text-[9px] text-gray-400">on</span>
                          <span className="text-xs font-bold text-black">{session.os}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-gray-400">{session.ip}</span>
                          <span className="text-[9px] text-gray-300">·</span>
                          <span className="text-[10px] text-gray-400">Last active: {new Date(session.lastActivity).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleKillSession(session._id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
        {(!data?.byUser?.length) && (
          <div className="border border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-400 italic">No active sessions. Sessions are created when users authenticate.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminSessions;
