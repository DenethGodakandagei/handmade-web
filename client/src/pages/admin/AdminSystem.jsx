import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, HardDrive, RefreshCcw, Activity, Globe2, Radio, Target, MapPin, Network, Wifi, ShieldCheck, Database, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

import geoUrl from 'world-atlas/countries-110m.json';

const AdminSystem = () => {
  const [metrics, setMetrics] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, nodesRes] = await Promise.all([
        api.get('/system/metrics'),
        api.get('/system/nodes')
      ]);
      setMetrics(metricsRes.data);
      setNodes(nodesRes.data);
    } catch (err) {
      toast.error('Failed to connect to core telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
              <h1 className="text-3xl font-light tracking-tight text-black">System Heart</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Core Telemetry & Global Nodes</p>
          </div>
          <Button
              onClick={fetchData}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
          >
              <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Ping Core
          </Button>
      </header>

      {/* Hardware Metrics Block */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* CPU Load */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Computational Load</h3>
              </div>
              <p className="text-5xl lg:text-6xl font-light tracking-tighter text-black">
                {metrics?.cpu?.percentage}%
              </p>
              <div className="space-y-1">
                  <p className="text-xs text-gray-900 font-bold uppercase tracking-widest">{metrics?.cpu?.model}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{metrics?.cpu?.cores} Logical Cores Active</p>
              </div>
          </motion.div>

          {/* Memory Load */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Volatile Memory</h3>
              </div>
              <p className="text-5xl lg:text-6xl font-light tracking-tighter text-black">
                {metrics?.memory?.percentage}%
              </p>
              <div className="space-y-1">
                  <p className="text-xs text-gray-900 font-bold uppercase tracking-widest">{metrics?.memory?.used} / {metrics?.memory?.total}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active RAM Allocation</p>
              </div>
          </motion.div>

          {/* Platform Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Uptime Architecture</h3>
              </div>
              <p className="text-5xl lg:text-6xl font-light tracking-tighter text-black">
                {metrics?.os?.uptime.split(' ')[0]} <span className="text-2xl text-gray-400">HRS</span>
              </p>
              <div className="space-y-1">
                  <p className="text-xs text-gray-900 font-bold uppercase tracking-widest">Platform: {metrics?.os?.platform}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Continuous Runtime</p>
              </div>
          </motion.div>
      </section>

      {/* Global Node Map */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="border border-gray-100 rounded-2xl bg-white p-8 overflow-hidden relative min-h-[500px] flex flex-col justify-center">
        <div className="absolute top-8 left-8 z-10">
          <h3 className="text-lg font-light tracking-tight">Global Node Distribution</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Active Server Clusters</p>
        </div>

        <div className="w-full h-full pt-10 px-0 -mx-4 -mb-10 opacity-80 pointer-events-none">
          <ComposableMap
            projectionConfig={{
              scale: 140,
              center: [0, 20]
            }}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#F3F4F6"
                    stroke="#E5E7EB"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#E5E7EB" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {nodes.map(({ id, name, coordinates, status }) => (
              <Marker key={id} coordinates={coordinates}>
                {/* Center dot */}
                <circle r={status === 'operational' ? 6 : 8} fill={status === 'operational' ? "#000000" : "#EF4444"} className="opacity-80" />
                {/* Blinking ring */}
                <circle r={24} fill={status === 'operational' ? "#000000" : "#EF4444"} className="opacity-20">
                   <animate attributeName="r" from="6" to="30" dur="2s" repeatCount="indefinite" />
                   <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </motion.section>

      {/* Infrastructure Nodes Details Grid */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="mb-8">
            <h3 className="text-xl font-light tracking-tight text-black flex items-center gap-3">
                <Network className="w-5 h-5" />
                Active Infrastructure Nodes
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-2">Deep packet inspection and global routing details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {nodes.map(node => (
                <div key={node.id} className="bg-white p-8 rounded-none border border-gray-200 flex flex-col gap-6">
                    {/* Node Header */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center border border-gray-200">
                                {node.type.includes('MongoDB') ? <Database className="w-4 h-4 text-black" /> : <Server className="w-4 h-4 text-black" />}
                            </div>
                            <div>
                               <span className="font-bold text-sm uppercase tracking-[0.2em] text-black block">{node.name}</span>
                               <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{node.type}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 border border-gray-200">
                           <span className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">{node.status}</span>
                           <div className={`w-2 h-2 rounded-full ${node.status === 'operational' ? 'bg-black' : 'bg-red-500 animate-pulse'}`} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-6 text-[10px] uppercase tracking-[0.1em]">
                        <div className="space-y-1.5">
                            <p className="text-gray-400 font-bold flex items-center gap-1.5"><Wifi className="w-3 h-3 text-blue-500"/> Public IPv4</p>
                            <p className="font-bold text-black tracking-widest text-xs font-mono">{node.ip}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-gray-400 font-bold flex items-center gap-1.5"><Target className="w-3 h-3 text-red-500"/> Carrier / ISP</p>
                            <p className="font-bold text-black truncate pr-2 tracking-widest">{node.details?.isp || 'UNIDENTIFIED'}</p>
                        </div>
                        <div className="space-y-1.5 pt-4 border-t border-gray-100">
                            <p className="text-gray-400 font-bold flex items-center gap-1.5"><MapPin className="w-3 h-3 text-green-500"/> Facility Location</p>
                            <p className="font-bold text-black tracking-widest">{node.details?.city}, {node.details?.country}</p>
                        </div>
                        <div className="space-y-1.5 pt-4 border-t border-gray-100">
                            <p className="text-gray-400 font-bold flex items-center gap-1.5"><Activity className="w-3 h-3 text-purple-500"/> Network ASN</p>
                            <p className="font-bold text-black truncate pr-2 tracking-widest">{node.details?.asn || 'UNKNOWN'}</p>
                        </div>
                        <div className="col-span-2 space-y-1.5 pt-4 border-t border-gray-100">
                            <p className="text-gray-400 font-bold flex items-center gap-1.5"><Globe2 className="w-3 h-3 text-orange-500"/> Geodesic Coordinates</p>
                            <p className="font-bold text-black tracking-widest font-mono bg-gray-50 p-3 border border-gray-200 mt-2">
                               LAT: {node.coordinates[1].toFixed(4)} ° &nbsp;&nbsp;|&nbsp;&nbsp; LON: {node.coordinates[0].toFixed(4)} °
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </motion.section>
    </div>
  );
};

export default AdminSystem;
