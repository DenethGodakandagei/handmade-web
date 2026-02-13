import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, TrendingUp, ShieldCheck, 
  Settings, UserPlus, Database, AlertCircle,
  RefreshCcw, Sparkles, Activity, ShieldAlert,
  Search, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import productService from '../api/services/productService';
import authService from '../api/services/authService';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeArtisans: 0,
    securityShields: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const prodRes = await productService.getAll();
      setProducts(prodRes.data.products);
      
      const userRes = await authService.getAllUsers();
      setUsers(userRes.data);
      
      setStats({
        totalUsers: userRes.data.length,
        totalProducts: prodRes.data.products.length,
        activeArtisans: userRes.data.filter(u => u.role === 'artisan').length,
        securityShields: 14 // Mocked for design
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    { 
      key: 'name', 
      label: 'IDENTITY', 
      render: (val, row) => (
        <div className="flex items-center space-x-4">
           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-xs text-primary border border-gray-100 uppercase tracking-widest">
              {val[0]}
           </div>
           <div className="space-y-1">
              <p className="font-black text-sm uppercase tracking-tighter">{val}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{row.email}</p>
           </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'SECTOR',
      render: (val) => (
        <Badge variant="outline" className={`text-[8px] h-5 px-3 uppercase tracking-widest font-black border-none ${val === 'admin' ? 'bg-black text-white' : val === 'artisan' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'GENESIS DATE',
      render: (val) => <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(val).toLocaleDateString()}</span>
    }
  ];

  return (
    <DashboardLayout>
      {/* Header - Security Core Luxury */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-8 md:space-y-0">
         <div className="space-y-6">
            <div className="flex items-center space-x-3 text-black">
               <ShieldCheck size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Core Administrative Command</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] text-balance">Ecosystem <br /><span className="text-primary italic font-light">Guardianship.</span></h1>
            <p className="text-gray-400 font-light text-lg max-w-xl">Central observatory for identity verification, archive integrity, and heritage security oversight.</p>
         </div>
         <div className="flex items-center gap-4">
            <Button variant="outline" className="h-16 px-10 rounded-full border-gray-200 text-xs font-black uppercase tracking-widest hover:bg-gray-50">
               <Database size={18} className="mr-3" />
               Archive Dump
            </Button>
            <Button className="btn-artisan h-16 px-10 rounded-full shadow-2xl shadow-primary/30">
               <UserPlus size={18} className="mr-3" />
               Auth Token
            </Button>
         </div>
      </div>

      {/* Admin Stats Suite */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
         <motion.div whileHover={{ y: -10 }} className="card-premium p-10 bg-white border-none shadow-3xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
               <Users size={24} className="text-primary" />
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Authenticated Souls</p>
                  <h3 className="text-5xl font-black tracking-tighter">{stats.totalUsers}</h3>
               </div>
            </div>
         </motion.div>

         <motion.div whileHover={{ y: -10 }} className="card-premium p-10 bg-white border-none shadow-3xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
               <Package size={24} className="text-primary" />
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Cataloged Objects</p>
                  <h3 className="text-5xl font-black tracking-tighter">{stats.totalProducts}</h3>
               </div>
            </div>
         </motion.div>

         <motion.div whileHover={{ y: -10 }} className="card-premium p-10 bg-white border-none shadow-3xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
               <TrendingUp size={24} className="text-primary" />
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Active Artisans</p>
                  <h3 className="text-5xl font-black tracking-tighter">{stats.activeArtisans}</h3>
               </div>
            </div>
         </motion.div>

         <motion.div whileHover={{ y: -10 }} className="card-premium p-10 bg-black text-white shadow-3xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
               <ShieldCheck size={24} className="text-primary" />
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Secure Shields</p>
                  <h3 className="text-5xl font-black tracking-tighter text-primary">{stats.securityShields}</h3>
               </div>
            </div>
         </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
         {/* Identity Management Table */}
         <div className="xl:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-6">
               <div className="flex items-center space-x-4">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Identity Registry</h2>
               </div>
               <div className="flex items-center gap-4">
                  <div className="relative">
                     <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                     <input className="bg-white border border-gray-100 rounded-full pl-10 pr-6 py-2 text-[10px] font-bold uppercase tracking-widest placeholder:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="LOCATE IDENTITY..." />
                  </div>
                  <Button variant="outline" size="icon" className="rounded-full border-gray-100 h-10 w-10">
                     <SlidersHorizontal size={14} className="text-gray-400" />
                  </Button>
               </div>
            </div>
            <div className="rounded-[3rem] overflow-hidden border border-gray-50 shadow-2xl shadow-black/5 bg-white">
               <DataTable 
                 columns={userColumns} 
                 data={users} 
                 isLoading={loading}
                 onEdit={(u) => console.log('Edit User', u)}
                 onDelete={(u) => console.log('Delete User', u)}
               />
            </div>
         </div>

         {/* Security Alerts Stream */}
         <div className="xl:col-span-4 space-y-8">
            <div className="flex items-center justify-between px-6">
               <div className="flex items-center space-x-4">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Anomaly pulse</h2>
               </div>
            </div>
            <div className="bg-white rounded-[4rem] border border-gray-50 overflow-hidden shadow-2xl shadow-black/5 relative">
               <div className="absolute top-0 right-0 p-8">
                  <ShieldAlert size={16} className="text-red-500 animate-pulse" />
               </div>
               <div className="p-10 divide-y divide-gray-50">
                  {[1,2,3].map(i => (
                     <div key={i} className="py-8 first:pt-0 last:pb-0 group">
                        <div className="flex items-center justify-between mb-3">
                           <Badge className="bg-red-50 text-red-600 border-none text-[8px] font-black px-3 py-1 uppercase tracking-widest">Critical Leak</Badge>
                           <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">14:0{i} UTC</span>
                        </div>
                        <p className="text-xs font-black uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">Unauthorized Access Attempt</p>
                        <p className="text-[10px] text-gray-400 font-medium italic">Handshake failed from node 128.0.01. Protocol enforced.</p>
                        <div className="mt-6 flex items-center justify-between">
                           <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center text-[8px] font-bold text-white">IA</div>
                           </div>
                           <Button variant="ghost" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-full">Neutralize</Button>
                        </div>
                     </div>
                  ))}
               </div>
               <Button variant="ghost" className="w-full h-16 rounded-none text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 border-t border-gray-50">
                  Full security manifest
               </Button>
            </div>

            {/* Performance Health Module */}
            <div className="bg-[#FAF9F6] p-12 rounded-[3.5rem] space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black">Core Latency</h3>
                  <RefreshCcw size={14} className="text-primary animate-spin-slow" />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-gray-400">Database pulse</span>
                     <span>98.4% Health</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                     <div className="w-[98%] h-full bg-primary shadow-[0_0_15px_rgba(164,92,64,0.3)]"></div>
                  </div>
               </div>
               <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-300">
                     <span>Node stability</span>
                     <span className="flex items-center text-primary">
                        <Activity size={10} className="mr-2" /> OPERATIONAL
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
