import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, RefreshCcw, ChevronLeft, ChevronRight, Shield, User, AlertCircle, AlertTriangle, Info, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const SEVERITY_CONFIG = {
  low: { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Info },
  medium: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: AlertCircle },
  high: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle },
  critical: { color: 'text-red-600 bg-red-50 border-red-200', icon: Shield }
};

const AdminAuditTrail = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterSeverity, setFilterSeverity] = useState('');

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 50 });
      if (filterSeverity) params.set('severity', filterSeverity);
      const res = await api.get(`/admin/audit?${params}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudit(); }, [page, filterSeverity]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  const { logs, pagination, distributions } = data || {};

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Audit Trail</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Complete Accountability Ledger — Every Action Recorded</p>
        </div>
        <Button onClick={fetchAudit} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Poll
        </Button>
      </header>

      {/* Severity Distribution */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {['low', 'medium', 'high', 'critical'].map((sev, i) => {
          const cfg = SEVERITY_CONFIG[sev];
          const SevIcon = cfg.icon;
          const count = distributions?.severity?.find(s => s._id === sev)?.count || 0;
          return (
            <motion.div
              key={sev}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border p-5 bg-white space-y-2 cursor-pointer transition-all hover:scale-[1.01] ${filterSeverity === sev ? 'ring-2 ring-black' : 'border-gray-200'}`}
              onClick={() => { setFilterSeverity(filterSeverity === sev ? '' : sev); setPage(1); }}
            >
              <div className="flex items-center gap-2">
                <SevIcon className={`w-3.5 h-3.5 ${cfg.color.split(' ')[0]}`} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">{sev}</span>
              </div>
              <p className="text-3xl font-light tracking-tighter">{count}</p>
            </motion.div>
          );
        })}
      </section>

      {/* Top Actions */}
      {distributions?.actions?.length > 0 && (
        <section className="border border-gray-200 p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Most Frequent Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            {distributions.actions.map(a => (
              <span key={a._id} className="text-[9px] uppercase tracking-widest font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5">
                {a._id} ({a.count})
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Audit Logs Table */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Timestamp</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Actor</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Action</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Description</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Severity</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">IP</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map(log => {
                const cfg = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.low;
                const SevIcon = cfg.icon;
                return (
                  <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-[10px] font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-black">{log.actor?.name || 'System'}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">{log.actor?.role}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-black bg-gray-50 border border-gray-200 px-2 py-1">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-600 max-w-[300px] truncate">{log.description}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold px-2 py-1 border ${cfg.color}`}>
                        <SevIcon className="w-3 h-3" />
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] font-mono text-gray-400">{log.ip}</td>
                  </tr>
                );
              })}
              {(!logs || logs.length === 0) && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-400 italic">No audit records found. Actions will appear here as admins operate the system.</td></tr>
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

export default AdminAuditTrail;
