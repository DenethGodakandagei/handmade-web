import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, RefreshCcw, MapPin, TrendingUp, Package, Activity, Info } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, Bar,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  ComposableMap, 
  Geographies, 
  Geography
} from "react-simple-maps";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

// Use same world atlas as System page
import geoUrl from 'world-atlas/countries-110m.json';

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#cccccc'];

const AdminGeoMap = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ext/geo');
      setData(res.data);
    } catch (err) { 
      toast.error('Failed to sync geographic telemetry'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  const countryData = (data?.byCountry || []).map(c => ({ 
    name: c._id || 'Unknown', 
    revenue: c.revenue, 
    orders: c.orders 
  }));
  
  const cityData = (data?.byCity || []).map(c => ({ 
    name: `${c._id?.city || '?'}, ${c._id?.country || '?'}`, 
    revenue: c.revenue, 
    orders: c.orders 
  })).slice(0, 10);

  const totalRevenue = data?.summary?.totalRevenue || 0;

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Exact Header Style from System/Overview */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
              <h1 className="text-3xl font-light tracking-tight text-black">Revenue Map</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Geographic Revenue & Global Node Capture</p>
          </div>
          <Button
              onClick={fetchData}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
          >
              <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Update Map
          </Button>
      </header>

      {/* Hero Metrics — Exact same style as System page */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Gross Revenue</h3>
              </div>
              <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black">${totalRevenue.toLocaleString()}</p>
              <div className="space-y-1">
                  <p className="text-xs text-black font-bold uppercase tracking-widest">Global Aggregate</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">All processed transactions</p>
              </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Market Coverage</h3>
              </div>
              <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black">{data?.summary?.totalCountries || 0}</p>
              <div className="space-y-1">
                  <p className="text-xs text-black font-bold uppercase tracking-widest">Active Countries</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unique sovereign entities</p>
              </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Primary Hub</h3>
              </div>
              <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black truncate pr-4">
                {countryData[0]?.name || 'None'}
              </p>
              <div className="space-y-1">
                  <p className="text-xs text-black font-bold uppercase tracking-widest">Top Market Share</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Highest revenue density</p>
              </div>
          </motion.div>

          {/* Added Top City Metric */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Top City</h3>
              </div>
              <p className="text-4xl lg:text-5xl font-light tracking-tighter text-black truncate pr-4">
                {cityData[0]?.name.split(',')[0] || 'None'}
              </p>
              <div className="space-y-1">
                  <p className="text-xs text-black font-bold uppercase tracking-widest">Urban Concentration</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Highest metropolitan revenue</p>
              </div>
          </motion.div>
      </section>

      {/* Global Node Map — Exact same style as System Map */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="border border-gray-100 rounded-2xl bg-white p-8 overflow-hidden relative min-h-[500px] flex flex-col justify-center">
        <div className="absolute top-8 left-8 z-10">
          <h3 className="text-lg font-light tracking-tight">Revenue Distribution</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Global Market Capture Density</p>
        </div>

        {hoveredCountry && (
          <div className="absolute top-8 right-8 z-20 bg-black text-white px-4 py-2 border border-gray-800 flex flex-col items-end">
             <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-50">Market Node</span>
             <span className="text-sm font-bold uppercase tracking-widest">{hoveredCountry.name}</span>
             <span className="text-xs font-mono font-bold mt-1">${hoveredCountry.revenue.toLocaleString()}</span>
          </div>
        )}

        <div className="w-full h-full pt-10 px-0 -mx-4 -mb-10 opacity-90">
          <ComposableMap
            projectionConfig={{
              scale: 140,
              center: [0, 20]
            }}
            width={800}
            height={450}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryMatch = data.byCountry?.find(c => c._id === geo.properties.name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        if (countryMatch) setHoveredCountry({ name: geo.properties.name, revenue: countryMatch.revenue });
                      }}
                      onMouseLeave={() => setHoveredCountry(null)}
                      fill={countryMatch ? "#000000" : "#F3F4F6"}
                      stroke={countryMatch ? "#000000" : "#E5E7EB"}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 0.3s" },
                        hover: { outline: "none", fill: countryMatch ? "#333333" : "#E5E7EB", cursor: countryMatch ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </motion.section>

      {/* Statistical Blocks — Clean Industrial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Top Countries Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-8">
           <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-light tracking-tight text-black flex items-center gap-3">
                  <TrendingUp className="w-5 h-5" />
                  Market Share Breakdown
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-2">Revenue density by sovereign entity</p>
           </div>
           
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical" margin={{ left: -20, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    width={140}
                    tick={{ fontSize: 10, fill: '#000', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '0px', border: '1px solid #000', boxShadow: 'none' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}
                    labelStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Bar dataKey="revenue" fill="#000" radius={0} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Division Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-8">
           <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-light tracking-tight text-black flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  Ecosystem Proportions
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-2">Percentage allocation of platform revenue</p>
           </div>
           
           <div className="h-64 w-full flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="revenue"
                    stroke="none"
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '0px', border: '1px solid #000', boxShadow: 'none' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                      <span className="text-2xl font-light">{countryData.length}</span>
                      <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Markets</p>
                  </div>
              </div>
           </div>

           <div className="space-y-2">
              {countryData.slice(0, 4).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] uppercase tracking-widest font-bold">
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-500">{item.name}</span>
                      </div>
                      <span className="text-black font-mono">${item.revenue.toLocaleString()}</span>
                  </div>
              ))}
           </div>
        </motion.div>
      </div>

      {/* Metropolitan Hubs — Industrial Table Style */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-8">
          <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-light tracking-tight text-black flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  Primary Metropolitan Hubs
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-2">Deep analytics of urban revenue concentration</p>
          </div>

          <div className="space-y-2">
            {cityData.map((city, i) => (
              <div key={i} className="group bg-white p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between hover:border-black transition-all duration-300">
                  {/* Left: Index and Location */}
                  <div className="flex items-center gap-6 mb-4 md:mb-0">
                      <span className="font-mono text-lg font-light text-gray-200 group-hover:text-black transition-colors">{String(i+1).padStart(2, '0')}</span>
                      <div>
                         <span className="font-bold text-sm uppercase tracking-[0.2em] text-black block">{city.name.split(',')[0]}</span>
                         <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">{city.name.split(',')[1]}</span>
                      </div>
                  </div>
                  
                  {/* Right: Telemetry data in seamless horizontal layout */}
                  <div className="grid grid-cols-3 gap-8 md:gap-16 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                      <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Net Revenue</p>
                          <p className="text-xs font-bold font-mono text-black">${city.revenue.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Event Volume</p>
                          <p className="text-xs font-bold font-mono text-black">{city.orders} Units</p>
                      </div>
                      <div className="space-y-1 text-right">
                          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Node Share</p>
                          <p className="text-xs font-bold font-mono text-black">{( (city.revenue / totalRevenue) * 100 ).toFixed(1)}%</p>
                      </div>
                  </div>
              </div>
            ))}
          </div>

          {!cityData.length && (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-none opacity-30">
               <p className="text-[10px] uppercase tracking-[0.3em] font-bold">No Metropolitan Data Available</p>
            </div>
          )}
      </motion.section>
    </div>
  );
};

export default AdminGeoMap;
