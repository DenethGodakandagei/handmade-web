import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, RefreshCcw, Shield, Package, Clock, CheckCircle2, AlertTriangle, XCircle, Cpu, HardDrive, MemoryStick, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminRuntime = () => {
  const [env, setEnv] = useState(null);
  const [deps, setDeps] = useState(null);
  const [cron, setCron] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('env');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [envRes, depsRes, cronRes] = await Promise.all([
        api.get('/admin/security/environment'),
        api.get('/admin/security/dependencies'),
        api.get('/admin/security/cron')
      ]);
      setEnv(envRes.data);
      setDeps(depsRes.data);
      setCron(cronRes.data);
    } catch (err) {
      toast.error('Failed to load runtime data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading && !env) {
    return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Runtime Diagnostics</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Environment Audit · Dependency Scanner · Cron Monitor</p>
        </div>
        <Button onClick={fetchAll} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Scan
        </Button>
      </header>

      {/* Runtime Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-blue-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Node</span></div>
          <p className="text-lg font-mono font-bold">{env?.runtime?.nodeVersion || '—'}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest">{env?.runtime?.platform} {env?.runtime?.arch}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><MemoryStick className="w-3.5 h-3.5 text-purple-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Heap Used</span></div>
          <p className="text-lg font-mono font-bold">{env?.runtime?.memoryUsage?.heapUsed || '—'}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest">of {env?.runtime?.memoryUsage?.heapTotal || '—'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><HardDrive className="w-3.5 h-3.5 text-green-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">RSS</span></div>
          <p className="text-lg font-mono font-bold">{env?.runtime?.memoryUsage?.rss || '—'}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest">Resident Set Size</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-orange-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Uptime</span></div>
          <p className="text-lg font-mono font-bold">{env?.runtime?.uptime || '—'}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest">PID: {env?.runtime?.pid}</p>
        </motion.div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['env', 'Environment Variables'], ['deps', 'Dependencies'], ['cron', 'Scheduled Tasks']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 border transition-colors ${tab === key ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Environment Variables */}
      {tab === 'env' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-200 bg-white overflow-hidden">
          <div className="bg-[#1a1b26] p-4 flex gap-2 items-center border-b border-gray-800">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-500 ml-4">root@server:~ $ env | grep -E "(NODE|MONGO|JWT|STRIPE|CLOUD|PORT)"</span>
          </div>
          <div className="bg-[#1a1b26] p-6 max-h-[500px] overflow-y-auto font-mono text-xs space-y-1">
            {Object.entries(env?.environment || {}).map(([key, value]) => {
              const isMasked = String(value).includes('•');
              return (
                <div key={key} className="flex gap-2 hover:bg-white/5 p-1 rounded">
                  <span className="text-blue-400 flex-shrink-0">{key}</span>
                  <span className="text-gray-500">=</span>
                  <span className={isMasked ? 'text-red-400' : 'text-green-400'}>{String(value)}</span>
                </div>
              );
            })}
            {(!env?.environment || Object.keys(env.environment).length === 0) && (
              <p className="text-gray-500">No environment variables to display</p>
            )}
          </div>
        </motion.section>
      )}

      {/* Tab: Dependencies */}
      {tab === 'deps' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Vulnerability Summary */}
          <div className={`border p-6 bg-white ${deps?.hasVulnerabilities ? 'border-red-200' : 'border-green-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              {deps?.hasVulnerabilities ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
              <h3 className="text-sm font-bold uppercase tracking-widest">{deps?.hasVulnerabilities ? 'Vulnerabilities Detected' : 'No Known Vulnerabilities'}</h3>
            </div>
            {deps?.vulnerabilities && Object.keys(deps.vulnerabilities).length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {Object.entries(deps.vulnerabilities).filter(([,v]) => v > 0).map(([level, count]) => {
                  const colors = { critical: 'text-red-600 bg-red-50 border-red-200', high: 'text-orange-600 bg-orange-50 border-orange-200', moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200', low: 'text-blue-600 bg-blue-50 border-blue-200', info: 'text-gray-600 bg-gray-50 border-gray-200' };
                  return (
                    <span key={level} className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 border ${colors[level] || colors.info}`}>
                      {level}: {count}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dependencies table */}
          <div className="border border-gray-200 bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Production Dependencies</h3>
              <span className="text-[10px] font-mono font-bold text-gray-400">{deps?.dependencies?.length || 0} packages</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
              {(deps?.dependencies || []).map(d => (
                <div key={d.name} className="bg-white p-3 space-y-1">
                  <p className="text-xs font-bold text-black truncate">{d.name}</p>
                  <p className="text-[10px] font-mono text-gray-400">{d.version}</p>
                </div>
              ))}
            </div>
          </div>

          {(deps?.devDependencies?.length > 0) && (
            <div className="border border-gray-200 bg-white overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Dev Dependencies</h3>
                <span className="text-[10px] font-mono font-bold text-gray-400">{deps?.devDependencies?.length || 0} packages</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
                {(deps?.devDependencies || []).map(d => (
                  <div key={d.name} className="bg-white p-3 space-y-1">
                    <p className="text-xs font-bold text-black truncate">{d.name}</p>
                    <p className="text-[10px] font-mono text-gray-400">{d.version}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Tab: Cron Jobs */}
      {tab === 'cron' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {(cron?.tasks || []).map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-gray-200 p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 flex items-center justify-center border flex-shrink-0 ${task.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <Clock className={`w-4 h-4 ${task.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">{task.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{task.description}</p>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">Schedule: {task.schedule}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Last Run</p>
                  <p className="text-xs font-mono">{task.lastRun ? new Date(task.lastRun).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Runs</p>
                  <p className="text-xs font-mono font-bold">{task.runs}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Errors</p>
                  <p className={`text-xs font-mono font-bold ${task.errors > 0 ? 'text-red-500' : 'text-green-500'}`}>{task.errors}</p>
                </div>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 border ${task.status === 'active' ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                  {task.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.section>
      )}
    </div>
  );
};

export default AdminRuntime;
