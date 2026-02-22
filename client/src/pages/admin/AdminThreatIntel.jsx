import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldBan, RefreshCcw, AlertTriangle, Target, Clock, Plus, Trash2, ChevronLeft, ChevronRight, Globe, Ban, Crosshair, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminThreatIntel = () => {
  const [threats, setThreats] = useState(null);
  const [blacklist, setBlacklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [newIP, setNewIP] = useState('');
  const [newReason, setNewReason] = useState('');
  const [tab, setTab] = useState('threats');

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const [threatsRes, blacklistRes] = await Promise.all([
        api.get(`/admin/security/threats?page=${page}&limit=30`),
        api.get('/admin/security/blacklist')
      ]);
      setThreats(threatsRes.data);
      setBlacklist(blacklistRes.data);
    } catch (err) {
      toast.error('Failed to load threat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchThreats(); }, [page]);

  const handleBlockIP = async () => {
    if (!newIP.trim()) return toast.error('Enter an IP address');
    try {
      await api.post('/admin/security/blacklist', { ip: newIP.trim(), reason: newReason || 'Manual block' });
      toast.success(`Blocked ${newIP}`);
      setNewIP('');
      setNewReason('');
      fetchThreats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block IP');
    }
  };

  const handleUnblock = async (id, ip) => {
    if (!window.confirm(`Remove ${ip} from blacklist?`)) return;
    try {
      await api.delete(`/admin/security/blacklist/${id}`);
      toast.success(`Unblocked ${ip}`);
      fetchThreats();
    } catch (err) {
      toast.error('Failed to unblock');
    }
  };

  if (loading && !threats) {
    return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Threat Intelligence</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Failed Login Tracker & IP Blacklist Manager</p>
        </div>
        <Button onClick={fetchThreats} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync
        </Button>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-red-200 p-5 bg-red-50/20 space-y-2">
          <div className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-400">Total Attempts</span></div>
          <p className="text-3xl font-light tracking-tighter text-red-600">{threats?.summary?.total || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="border border-orange-200 p-5 bg-orange-50/20 space-y-2">
          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-orange-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-400">Last 24h</span></div>
          <p className="text-3xl font-light tracking-tighter text-orange-600">{threats?.summary?.last24h || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="border border-yellow-200 p-5 bg-yellow-50/20 space-y-2">
          <div className="flex items-center gap-2"><Target className="w-3.5 h-3.5 text-yellow-600" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-yellow-600">Last Hour</span></div>
          <p className="text-3xl font-light tracking-tighter text-yellow-700">{threats?.summary?.lastHour || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="border border-gray-200 p-5 space-y-2">
          <div className="flex items-center gap-2"><Ban className="w-3.5 h-3.5 text-black" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Blocked IPs</span></div>
          <p className="text-3xl font-light tracking-tighter">{blacklist?.total || 0}</p>
        </motion.div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['threats', 'Failed Logins'], ['blacklist', 'IP Blacklist'], ['offenders', 'Top Offenders']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 border transition-colors ${tab === key ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Failed Logins */}
      {tab === 'threats' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Timestamp</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Email Targeted</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">IP Address</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">User Agent</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Reason</th>
                </tr>
              </thead>
              <tbody>
                {(threats?.attempts || []).map(a => (
                  <tr key={a._id} className="border-b border-gray-50 hover:bg-red-50/20 transition-colors">
                    <td className="p-4 text-[10px] font-mono text-gray-500 whitespace-nowrap">{new Date(a.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                    <td className="p-4 text-xs font-bold text-red-600">{a.email}</td>
                    <td className="p-4 text-xs font-mono">{a.ip}</td>
                    <td className="p-4 text-[10px] text-gray-400 max-w-[200px] truncate">{a.userAgent}</td>
                    <td className="p-4"><span className="text-[9px] uppercase tracking-widest font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-1">{a.reason}</span></td>
                  </tr>
                ))}
                {(!threats?.attempts?.length) && <tr><td colSpan={5} className="p-8 text-center text-sm text-gray-400 italic">No failed login attempts recorded yet</td></tr>}
              </tbody>
            </table>
          </div>
          {threats?.pagination?.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Page {threats.pagination.page} of {threats.pagination.pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage(Math.min(threats.pagination.pages, page + 1))} disabled={page === threats.pagination.pages} className="p-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Tab: IP Blacklist */}
      {tab === 'blacklist' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Add IP Form */}
          <div className="border border-gray-200 p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2"><ShieldBan className="w-4 h-4" /> Block IP Address</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input type="text" placeholder="e.g. 192.168.1.100" value={newIP} onChange={e => setNewIP(e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-200 text-sm font-mono focus:outline-none focus:border-black" />
              <input type="text" placeholder="Reason (optional)" value={newReason} onChange={e => setNewReason(e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-black" />
              <button onClick={handleBlockIP} className="bg-red-600 text-white px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-red-700 flex items-center gap-2"><Plus size={12} /> Block</button>
            </div>
          </div>

          <div className="border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">IP Address</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Reason</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Blocked By</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Hits Blocked</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Date</th>
                  <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {(blacklist?.ips || []).map(entry => (
                  <tr key={entry._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-mono font-bold text-red-600">{entry.ip}</td>
                    <td className="p-4 text-xs text-gray-600">{entry.reason}</td>
                    <td className="p-4 text-xs text-gray-500">{entry.autoBlocked ? <span className="text-orange-500 font-bold">AUTO</span> : entry.blockedBy?.name || 'System'}</td>
                    <td className="p-4 text-sm font-mono font-bold">{entry.hitCount || 0}</td>
                    <td className="p-4 text-[10px] font-mono text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><button onClick={() => handleUnblock(entry._id, entry.ip)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
                {(!blacklist?.ips?.length) && <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-400 italic">No IPs blacklisted</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {/* Tab: Top Offenders */}
      {tab === 'offenders' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-gray-200 p-6 bg-white">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Crosshair className="w-3.5 h-3.5" /> Top Offending IPs</h3>
            <div className="space-y-3">
              {(threats?.topOffenders || []).map((o, i) => (
                <div key={o._id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-gray-300 w-5">{i + 1}</span>
                    <span className="text-sm font-mono font-bold text-red-600">{o._id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono">{o.count} attempts</span>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{o.emails?.length || 0} emails targeted</p>
                  </div>
                </div>
              ))}
              {(!threats?.topOffenders?.length) && <p className="text-sm text-gray-400 italic">No data</p>}
            </div>
          </div>
          <div className="border border-gray-200 p-6 bg-white">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Fingerprint className="w-3.5 h-3.5" /> Most Targeted Accounts</h3>
            <div className="space-y-3">
              {(threats?.topTargetedEmails || []).map((e, i) => (
                <div key={e._id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-gray-300 w-5">{i + 1}</span>
                    <span className="text-sm font-bold">{e._id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono">{e.count} attacks</span>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{e.ips?.length || 0} unique IPs</p>
                  </div>
                </div>
              ))}
              {(!threats?.topTargetedEmails?.length) && <p className="text-sm text-gray-400 italic">No data</p>}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default AdminThreatIntel;
