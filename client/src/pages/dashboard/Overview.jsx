
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { TrendingUp } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import useAuthStore from '@/store/authStore';

const Overview = () => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
                <Spinner />
            </div>
        );
    }
    // Premium Dummy Data
    const revenueData = [
        { name: 'Mon', value: 4000 },
        { name: 'Tue', value: 3000 },
        { name: 'Wed', value: 5000 },
        { name: 'Thu', value: 2780 },
        { name: 'Fri', value: 6890 },
        { name: 'Sat', value: 8390 },
        { name: 'Sun', value: 12490 },
    ];



    // Minimal Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-100 p-4 shadow-xl rounded-lg">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{label}</p>
                    <p className="text-xl font-light text-black">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-12">
            <DashboardHeader title="Overview" subtitle={`Welcome back, ${user?.name || 'Artisan'}`} />

            {/* HIGH IMPACT STATS - RESTORED PREMIUM TYPOGRAPHY */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                         <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Total Revenue</h3>
                         <span className="bg-green-50 text-green-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +12%
                         </span>
                    </div>
                    <p className="text-6xl font-light tracking-tighter text-black">$84,230</p>
                    <p className="text-xs text-gray-400 tracking-wide">Last 30 days performance</p>
                </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                         <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Active Orders</h3>
                    </div>
                    <p className="text-6xl font-light tracking-tighter text-black">156</p>
                    <p className="text-xs text-gray-400 tracking-wide">12 pending shipment</p>
                </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                         <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Avg. Order Val</h3>
                    </div>
                    <p className="text-6xl font-light tracking-tighter text-black">$542</p>
                    <p className="text-xs text-gray-400 tracking-wide">+5% from last month</p>
                </motion.div>
            </section>

            {/* CHARTS & MESSAGES SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* Main Area Chart */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 border border-gray-100 rounded-2xl p-8 bg-white"
                >
                    <div className="mb-8 flex justify-between items-center">
                        <h3 className="text-lg font-light tracking-tight">Revenue Trend</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px' }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#000000" 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Sales by Category Chart */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="border border-gray-100 rounded-2xl p-8 bg-white"
                >
                    <div className="mb-8">
                        <h3 className="text-lg font-light tracking-tight">Top Categories</h3>
                    </div>
                    
                    <div className="h-64 w-full relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Pottery', value: 400 },
                                        { name: 'Woodwork', value: 300 },
                                        { name: 'Textiles', value: 300 },
                                        { name: 'Jewelry', value: 200 },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {/* Minimal Monochrome Palette */}
                                    <Cell fill="#000000" />
                                    <Cell fill="#333333" />
                                    <Cell fill="#666666" />
                                    <Cell fill="#999999" />
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="text-2xl font-light">1.2k</span>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">Items</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {[
                            { label: 'Pottery', color: 'bg-black' }, 
                            { label: 'Woodwork', color: 'bg-gray-800' },
                            { label: 'Textiles', color: 'bg-gray-500' }
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <span className="text-gray-600">{item.label}</span>
                                </div>
                                <span className="font-medium">32%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            
        </div>
    );
};

export default Overview;
