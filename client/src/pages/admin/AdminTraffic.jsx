import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCcw, Globe, Clock, ArrowUp, ArrowDown, Server, Wifi } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminTraffic = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchTraffic = async () => {
    try {
      const res = await api.get('/admin/security/traffic');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      if (loading) toast.error('Failed to load traffic data');
    }
  };

  useEffect(() => {
    fetchTraffic();
    intervalRef.current = setInterval(fetchTraffic, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-[calc(100vh-120px)]"><Spinner /></div>;
  }

  const { live, methods, statusCodes, topEndpoints, topIPs, rateLimitOffenders, perSecond } = data || {};

  const chartData = (perSecond || []).map(d => ({
    time: new Date(d.second * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    requests: d.count
  }));

  const methodColors = { GET: 'text-green-600', POST: 'text-blue-600', PUT: 'text-yellow-600', DELETE: 'text-red-600', PATCH: 'text-purple-600' };
  const statusColors = { '2': 'text-green-600', '3': 'text-blue-600', '4': 'text-yellow-600', '5': 'text-red-600' };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Traffic Monitor</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Live Request Telemetry & Rate Limit Dashboard — Auto-refreshing every 3s</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-600">Live</span>
        </div>
      </header>

      {/* Live Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Req/Sec</span></div>
          <p className="text-4xl font-light tracking-tighter">{live?.requestsPerSecond || '0.00'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Wifi className="w-3.5 h-3.5 text-blue-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Last 60s</span></div>
          <p className="text-4xl font-light tracking-tighter">{live?.requestsLast60s || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Server className="w-3.5 h-3.5 text-purple-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Total Since Boot</span></div>
          <p className="text-4xl font-light tracking-tighter">{live?.totalSinceStart?.toLocaleString() || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-green-500" /><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Uptime</span></div>
          <p className="text-4xl font-light tracking-tighter">{live?.uptimeSeconds ? `${Math.floor(live.uptimeSeconds / 60)}m` : '0m'}</p>
        </motion.div>
      </section>

      {/* Real-Time Chart */}
      <section className="border border-gray-200 p-8 bg-white">
        <div className="mb-6">
          <h3 className="text-lg font-light tracking-tight">Request Volume (60s Window)</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">Requests per second — live feed</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#9ca3af' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} allowDecimals={false} />
              <RechartsTooltip contentStyle={{ borderRadius: '0', border: '1px solid #e5e7eb', boxShadow: 'none', fontSize: '11px' }} />
              <Area type="monotone" dataKey="requests" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#trafficGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Method + Status Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="border border-gray-200 p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">HTTP Methods (60s)</h3>
          <div className="space-y-3">
            {Object.entries(methods || {}).sort(([,a],[,b]) => b-a).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <span className={`text-sm font-mono font-bold ${methodColors[method] || 'text-gray-600'}`}>{method}</span>
                <span className="text-sm font-mono">{count}</span>
              </div>
            ))}
            {!methods || Object.keys(methods).length === 0 && <p className="text-sm text-gray-400 italic">No data</p>}
          </div>
        </section>
        <section className="border border-gray-200 p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Status Codes (60s)</h3>
          <div className="space-y-3">
            {Object.entries(statusCodes || {}).sort(([,a],[,b]) => b-a).map(([code, count]) => (
              <div key={code} className="flex items-center justify-between">
                <span className={`text-sm font-mono font-bold ${statusColors[code[0]] || 'text-gray-600'}`}>{code}</span>
                <span className="text-sm font-mono">{count}</span>
              </div>
            ))}
            {!statusCodes || Object.keys(statusCodes).length === 0 && <p className="text-sm text-gray-400 italic">No data</p>}
          </div>
        </section>
      </div>

      {/* Top Endpoints + IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="border border-gray-200 p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><ArrowUp className="w-3.5 h-3.5" /> Hottest Endpoints</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(topEndpoints || []).map((e, i) => (
              <div key={e.endpoint} className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-gray-300 w-5">{i + 1}</span>
                  <span className="text-xs font-mono text-black truncate">{e.endpoint}</span>
                </div>
                <span className="text-xs font-mono font-bold text-black flex-shrink-0 ml-2">{e.count}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="border border-gray-200 p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Top IPs (by volume)</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(topIPs || []).map((ip, i) => (
              <div key={ip.ip} className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-300 w-5">{i + 1}</span>
                  <span className="text-sm font-mono font-bold">{ip.ip}</span>
                </div>
                <span className="text-xs font-mono font-bold">{ip.count} req</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Rate Limit Offenders */}
      {rateLimitOffenders?.length > 0 && (
        <section className="border border-red-200 p-6 bg-red-50/20">
          <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2"><ArrowDown className="w-3.5 h-3.5" /> Rate Limit Violators (429)</h3>
          <div className="space-y-2">
            {rateLimitOffenders.map(o => (
              <div key={o.ip} className="flex items-center justify-between border-b border-red-100 pb-2">
                <span className="text-sm font-mono font-bold text-red-600">{o.ip}</span>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold">{o.count} blocked</span>
                  <p className="text-[9px] text-gray-400">Last: {new Date(o.lastHit).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminTraffic;
