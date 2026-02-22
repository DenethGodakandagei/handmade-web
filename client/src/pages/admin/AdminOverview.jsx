import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, TrendingUp, ShieldCheck, 
  Database, AlertCircle, RefreshCcw, Activity, ShieldAlert,
  ArrowUpRight, Target, BarChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import userService from '../../api/services/userService';
import productService from '../../api/services/productService';
import orderService from '../../api/services/orderService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Spinner from '@/components/ui/Spinner';

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#cccccc'];

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeArtisans: 0,
    totalRevenue: 0,
    totalOrders: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [userRoleData, setUserRoleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        userService.getAll(),
        productService.getAll({ limit: 1000 }), 
        orderService.getAll()
      ]);

      const users = usersRes.data || [];
      const productsData = productsRes.data;
      const products = Array.isArray(productsData) ? productsData : (productsData?.products || []);
      const orders = ordersRes.data || [];

      // Calculate simple stats
      const artisans = users.filter(u => u.role === 'artisan').length;
      const customers = users.filter(u => u.role === 'user').length;
      const admins = users.filter(u => u.role === 'admin').length;

      const totalRev = orders.reduce((acc, order) => {
        return order.paymentStatus === 'paid' ? acc + (order.totalPrice || 0) : acc;
      }, 0);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        activeArtisans: artisans,
        totalOrders: orders.length,
        totalRevenue: totalRev
      });

      // Pie chart for roles
      setUserRoleData([
        { name: 'Customers', value: customers },
        { name: 'Artisans', value: artisans },
        { name: 'Admins', value: admins }
      ]);

      // Line chart for last 7 days revenue
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          date: d.toISOString().split('T')[0], 
          revenue: 0,
          ordersCount: 0 
        };
      });

      orders.forEach(order => {
        if(order.paymentStatus === 'paid' && order.createdAt) {
          const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
          const dayMatch = last7Days.find(d => d.date === dateStr);
          if (dayMatch) {
            dayMatch.revenue += (order.totalPrice || 0);
            dayMatch.ordersCount += 1;
          }
        }
      });

      // Format date for display
      const formattedSales = last7Days.map(d => ({
        ...d,
        name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
      }));

      setSalesData(formattedSales);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-10">
      <DashboardHeader title="Ecosystem Overview" subtitle="Core Administrative Command" />

      {/* KPI Cards - EXACTLY MATCHING ARTISAN STYLE */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
          >
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Revenue Nexus</h3>
              </div>
              <p className="text-5xl lg:text-6xl font-light tracking-tighter text-black">
                ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 tracking-wide">Total verified volume</p>
          </motion.div>

          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
          >
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Population</h3>
              </div>
              <p className="text-5xl lg:text-6xl font-light tracking-tighter text-black">{stats.totalUsers}</p>
              <p className="text-xs text-gray-400 tracking-wide">Ecosystem users</p>
          </motion.div>

          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
          >
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Archive Core</h3>
              </div>
              <p className="text-5xl lg:text-6xl font-light tracking-tighter text-black">{stats.totalProducts}</p>
              <p className="text-xs text-gray-400 tracking-wide">Cataloged units</p>
          </motion.div>

          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
          >
              <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Total Orders</h3>
              </div>
              <p className="text-5xl lg:text-6xl font-light tracking-tighter text-black">{stats.totalOrders}</p>
              <p className="text-xs text-gray-400 tracking-wide">Lifecycle events</p>
          </motion.div>
      </section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        
        {/* Line Chart */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 border border-gray-100 rounded-2xl p-8 bg-white"
        >
          <div className="mb-8 flex justify-between items-center">
            <h3 className="text-lg font-light tracking-tight">Revenue Trajectory</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{ fontSize: 10, fill: '#9ca3af' }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'normal', fontSize: '20px', color: '#000' }}
                  labelStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="border border-gray-100 rounded-2xl p-8 bg-white"
        >
          <div className="mb-8 flex justify-between items-center">
            <h3 className="text-lg font-light tracking-tight">Ecosystem Division</h3>
          </div>
          <div className="h-64 w-full flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="text-2xl font-light">{stats.totalUsers}</span>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Users</p>
                </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
              {userRoleData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                  </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOverview;
