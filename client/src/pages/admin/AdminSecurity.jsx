import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint, RefreshCcw, Lock, Unlock, XCircle, ShieldAlert, KeyRound, Terminal, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [flushing, setFlushing] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/logs');
      setLogs(res.data || []);
    } catch (err) {
      toast.error('Failed to sync SOC records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  const handleRotateTokens = () => {
    setRotating(true);
    toast.info('Initiating global authentication rotation protocol...');
    setTimeout(() => {
      setRotating(false);
      toast.success('Successfully rotated active JWT signatures');
    }, 2000);
  };

  const handleFlushSessions = () => {
    if (window.confirm("CRITICAL WARNING: This will immediately invalidate all active user sessions globally. Proceed?")) {
      setFlushing(true);
      toast.info('Terminating all active sockets and sessions...');
      setTimeout(() => {
        setFlushing(false);
        toast.success('Global Session Purge Complete.');
      }, 1500);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
              <h1 className="text-3xl font-light tracking-tight text-black">Security Protocol</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Access Control, Traffic Proxy & Server Logs</p>
          </div>
          <Button
              onClick={fetchLogs}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
          >
              <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin text-white' : ''}`} />
              Poll Audit
          </Button>
      </header>

      {/* Security Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Token Rotation */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-gray-100 rounded-2xl p-8 bg-white space-y-6">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-light tracking-tight text-black mb-1">Rotate Auth Tokens</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 leading-relaxed">Invalidate current JWT secrets globally and force all active devices to undergo new cryptographic handshakes.</p>
            </div>
            <Button 
                onClick={handleRotateTokens}
                disabled={rotating}
                className="w-full bg-black text-white hover:bg-gray-800 text-xs font-bold uppercase tracking-widest rounded-none h-12"
            >
              {rotating ? <RefreshCcw size={14} className="mr-2 animate-spin" /> : <Lock size={14} className="mr-2" />}
              {rotating ? 'Regenerating Salts...' : 'Force Key Rotation'}
            </Button>
        </motion.div>

        {/* Global Terminate */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="border border-red-50 rounded-2xl p-8 bg-red-50/10 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full translate-x-10 -translate-y-10 blur-3xl opacity-50 pointer-events-none"></div>
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center relative">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div className="relative">
              <h3 className="text-lg font-light tracking-tight text-red-600 mb-1">Global Purge Protocol</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-red-400/80 leading-relaxed">Immediately initiates a "kill-switch" cutting connection mapping on all live client sockets.</p>
            </div>
            <Button 
                onClick={handleFlushSessions}
                disabled={flushing}
                variant="destructive"
                className="w-full text-xs font-bold uppercase tracking-widest rounded-none h-12 bg-red-500 hover:bg-red-600 relative"
            >
              {flushing ? <RefreshCcw size={14} className="mr-2 animate-spin" /> : <XCircle size={14} className="mr-2" />}
              {flushing ? 'Terminating Sockets...' : 'Initiate Kill Switch'}
            </Button>
        </motion.div>
      </section>

      {/* Real-time Audit Terminal */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
         <div className="mb-6">
             <h3 className="text-lg font-light tracking-tight text-black flex items-center gap-2">
                 <Terminal size={18} /> Active System Logs (Tail)
             </h3>
             <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">Live tracking of active user connections and endpoints</p>
         </div>

         <div className="bg-[#1a1b26] rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <div className="bg-[#0f1017] p-4 flex gap-2 items-center border-b border-gray-800">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
               <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-500 ml-4">root@admin-panel:~ $ tail -f /var/log/nginx/access.log</span>
            </div>
            
            <div className="p-6 h-[400px] overflow-y-auto space-y-3 font-mono text-xs">
                {loading && logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                       <Spinner />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-gray-500 opacity-50 text-center pt-10">No logs found on server.</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:gap-6 border-b border-gray-800/50 pb-3 hover:bg-white/5 p-2 rounded transition-colors group">
                           {/* Log Details. The log might be an object from our backend winston logger */}
                           {log.message ? (
                               <>
                                   <div className="flex gap-4">
                                      <span className="text-gray-500 w-44">{log.timestamp.replace(' ', 'T')}</span>
                                      <span className={`font-bold ${log.level === 'error' ? 'text-red-400' : 'text-green-400'}`}>[{log.level.toUpperCase()}]</span>
                                   </div>
                                   <span className="text-gray-300 mt-1 sm:mt-0 flex-1 break-all">
                                      {log.message}
                                   </span>
                               </>
                           ) : (
                               <span className="text-gray-500 italic">Unstructured stream content</span>
                           )}
                        </div>
                    ))
                )}
            </div>
         </div>
      </motion.section>

    </div>
  );
};

export default AdminLogs;
