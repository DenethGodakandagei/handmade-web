import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   Plus, Package, DollarSign, List,
   TrendingUp, Clock, CheckCircle, RefreshCcw,
   Edit, Trash2, ExternalLink, Sparkles, Activity,
   Zap, ArrowUpRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import productService from '../api/services/productService';
import orderService from '../api/services/orderService';
import customizationService from '../api/services/customizationService';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ArtisanDashboard = () => {
   const [products, setProducts] = useState([]);
   const [orders, setOrders] = useState([]);
   const [stats, setStats] = useState({
      totalSales: 0,
      activeProducts: 0,
      activeProducts: 0,
      pendingOrders: 0,
      pendingRequests: 0
   });
   const [customizationRequests, setCustomizationRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const { user } = useAuthStore();

   useEffect(() => {
      fetchDashData();
   }, []);

   const fetchDashData = async () => {
      try {
         const prodRes = await productService.getAll({ artisan: user._id });
         setProducts(prodRes.data.products);

         const orderRes = await orderService.getAll();
         setOrders(orderRes.data);

         const requestRes = await customizationService.getAll();
         setCustomizationRequests(requestRes.data || []);

         setStats({
            totalSales: orderRes.data.reduce((acc, curr) => acc + curr.totalAmount, 0),
            activeProducts: prodRes.data.products.length,
            pendingOrders: orderRes.data.filter(o => o.status === 'Pending').length,
            pendingRequests: requestRes.data ? requestRes.data.filter(r => r.status === 'Pending').length : 0
         });
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleStatusUpdate = async (id, status) => {
      try {
         await customizationService.updateStatus(id, status);
         // Refresh data
         fetchDashData();
      } catch (error) {
         console.error("Failed to update status", error);
      }
   };

   const productColumns = [
      {
         key: 'images',
         label: 'Archive',
         render: (val) => (
            <div className="w-14 h-16 bg-gray-50 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-gray-100">
               <img src={val?.[0]} alt="" className="w-full h-full object-cover" />
            </div>
         )
      },
      {
         key: 'name',
         label: 'Identity',
         render: (val, row) => (
            <div className="space-y-1">
               <p className="font-black truncate max-w-[200px] uppercase tracking-tighter text-sm">{val}</p>
               <p className="text-[9px] text-primary font-bold uppercase tracking-widest">{row.category?.name}</p>
            </div>
         )
      },
      {
         key: 'stock',
         label: 'inventory',
         render: (val) => (
            <div className="flex items-center space-x-3">
               <div className={`w-2 h-2 rounded-full ${val > 0 ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-red-500'}`}></div>
               <span className="text-[11px] font-black uppercase tracking-widest">{val} Units</span>
            </div>
         )
      },
      { key: 'price', label: 'Valuation', render: (val) => <span className="font-black text-sm">${val}</span> },
   ];

   return (
      <DashboardLayout>
         {/* Header - Artisan Luxury */}
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-8 md:space-y-0 relative">
            <div className="space-y-6">
               <div className="flex items-center space-x-3 text-primary">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Workshop Authority</span>
               </div>
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] text-balance">Workshop <br /><span className="text-primary italic font-light">Command.</span></h1>
               <p className="text-gray-400 font-light text-lg max-w-xl">Master control for your heritage archives, production sequences, and financial lineage.</p>
            </div>
            <Button className="btn-artisan h-16 px-10 rounded-full shadow-2xl shadow-primary/30">
               <Plus size={20} className="mr-3" />
               <span className="text-xs font-black uppercase tracking-widest">catalog New lineage</span>
            </Button>
         </div>

         {/* Modern Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-2xl shadow-black/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <DollarSign size={24} />
                     </div>
                     <TrendingUp size={16} className="text-green-500" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 text-balance">Master Valuation</p>
                     <h3 className="text-5xl font-black tracking-tighter">${stats.totalSales.toLocaleString()}</h3>
                  </div>
               </div>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-2xl shadow-black/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-black">
                        <Package size={24} />
                     </div>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Authenticated archives</p>
                     <h3 className="text-5xl font-black tracking-tighter">{stats.activeProducts}</h3>
                  </div>
               </div>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-black text-white p-10 rounded-[3rem] shadow-2xl shadow-black/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                        <Clock size={24} />
                     </div>
                     <Activity size={16} className="text-primary animate-pulse" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Pending Succession</p>
                     <h3 className="text-5xl font-black tracking-tighter text-primary">{stats.pendingOrders}</h3>
                  </div>
               </div>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-2xl shadow-black/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles size={24} />
                     </div>
                     <Activity size={16} className="text-primary animate-pulse" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Bespoke Requests</p>
                     <h3 className="text-5xl font-black tracking-tighter text-primary">{stats.pendingRequests}</h3>
                  </div>
               </div>
            </motion.div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
            {/* Main Record Table */}
            <div className="xl:col-span-8 space-y-10">
               <div className="flex items-center justify-between px-6">
                  <div className="flex items-center space-x-3">
                     <div className="w-1 h-1 bg-primary rounded-full"></div>
                     <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Master Record index</h2>
                  </div>
                  <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-full">Expand archives</Button>
               </div>
               <div className="rounded-[3rem] overflow-hidden border border-gray-50 shadow-2xl shadow-black/5 bg-white">
                  <DataTable
                     columns={productColumns}
                     data={products}
                     isLoading={loading}
                     onEdit={(p) => console.log('Edit', p)}
                     onDelete={(p) => console.log('Delete', p)}
                  />
               </div>
            </div>

            {/* Transaction Stream */}
            <div className="xl:col-span-4 space-y-10">
               <div className="flex items-center justify-between px-6">
                  <div className="flex items-center space-x-3">
                     <div className="w-1 h-1 bg-primary rounded-full"></div>
                     <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Pulse Log</h2>
                  </div>
               </div>
               <div className="bg-white rounded-[3rem] border border-gray-50 overflow-hidden shadow-2xl shadow-black/5">
                  <div className="divide-y divide-gray-50">
                     {orders.length > 0 ? orders.slice(0, 5).map(order => (
                        <div key={order._id} className="p-10 hover:bg-gray-50/50 transition-colors group flex items-center justify-between gap-6">
                           <div className="flex items-center space-x-6">
                              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-black uppercase shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                                 #{order._id.slice(-4)}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">Purchase Seq</p>
                                 <p className="text-[9px] text-gray-300 uppercase font-black tracking-widest mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="text-right space-y-2">
                              <p className="text-md font-black text-black tracking-tighter">${order.totalAmount}</p>
                              <Badge variant="outline" className={`text-[8px] h-5 rounded-full px-3 uppercase tracking-widest font-black border-none ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                 {order.status}
                              </Badge>
                           </div>
                        </div>
                     )) : (
                        <div className="p-20 text-center">
                           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Zap size={24} className="text-gray-200" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No active pulses</p>
                        </div>
                     )}
                  </div>
                  {orders.length > 0 && (
                     <Button variant="ghost" className="w-full h-16 rounded-none text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 border-t border-gray-50">
                        Access full history
                     </Button>
                  )}
               </div>

               {/* System Health Module */}
               <div className="card-premium bg-primary p-12 relative overflow-hidden text-white shadow-3xl shadow-primary/20">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rotate-45 -translate-y-24 translate-x-24 blur-3xl"></div>
                  <div className="relative z-10 flex items-center justify-between mb-10">
                     <h3 className="text-xl font-extrabold uppercase tracking-tighter">System Health</h3>
                     <RefreshCcw size={16} className="animate-spin-slow opacity-50" />
                  </div>
                  <div className="space-y-8 relative z-10">
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                           <span className="text-white/50">Core Latency</span>
                           <span>0.4ms</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="w-[95%] h-full bg-white shadow-[0_0_10px_white]"></div>
                        </div>
                     </div>
                     <div className="pt-6 flex items-center justify-between border-t border-white/10 text-[9px] font-black uppercase tracking-[0.3em]">
                        <span className="text-white/50">Node synchronization</span>
                        <span className="flex items-center text-white">
                           <CheckCircle size={10} className="mr-2" /> TOTAL SYNC
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Customization Requests Section */}
         <div className="mt-20 mb-20 space-y-10">
            <div className="flex items-center justify-between px-6">
               <div className="flex items-center space-x-3">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Bespoke Commissions</h2>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {customizationRequests.length > 0 ? (
                  customizationRequests.map((req) => (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        key={req._id}
                        className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full translate-x-8 -translate-y-8 group-hover:bg-primary/5 transition-colors"></div>

                        <div className="relative z-10 space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-4">
                                 <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                                    {req.product?.images?.[0] && <img src={req.product.images[0]} alt="" className="w-full h-full object-cover" />}
                                 </div>
                                 <div>
                                    <h4 className="font-black text-sm uppercase tracking-tight">{req.product?.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Client: {req.buyer?.name}</p>
                                 </div>
                              </div>
                              <Badge className={`uppercase tracking-widest text-[8px] font-black border-none ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                    req.status === 'Accepted' ? 'bg-green-50 text-green-600' :
                                       'bg-red-50 text-red-600'
                                 }`}>
                                 {req.status}
                              </Badge>
                           </div>

                           <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Specifications</p>
                              {req.customizations?.map((c, idx) => (
                                 <div key={idx} className="flex justify-between text-xs font-medium">
                                    <span className="text-gray-500">{c.optionName}:</span>
                                    <span className="font-bold">{c.selectedValue}</span>
                                 </div>
                              ))}
                              {req.notes && (
                                 <div className="pt-2 border-t border-gray-100 mt-2">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Notes</p>
                                    <p className="text-xs text-gray-600 italic">"{req.notes}"</p>
                                 </div>
                              )}
                           </div>

                           {req.status === 'Pending' && (
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                 <Button
                                    onClick={() => handleStatusUpdate(req._id, 'Accepted')}
                                    className="bg-black text-white hover:bg-gray-800 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest"
                                 >
                                    Accept
                                 </Button>
                                 <Button
                                    onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                                    variant="outline"
                                    className="border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest"
                                 >
                                    Decline
                                 </Button>
                              </div>
                           )}
                           {req.status === 'Accepted' && (
                              <div className="pt-2">
                                 <Button
                                    onClick={() => handleStatusUpdate(req._id, 'Completed')}
                                    className="w-full bg-green-600 text-white hover:bg-green-700 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest"
                                 >
                                    Mark Completed
                                 </Button>
                              </div>
                           )}
                        </div>
                     </motion.div>
                  ))
               ) : (
                  <div className="col-span-full py-12 text-center border border-dashed border-gray-200 rounded-[2rem]">
                     <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">No bespoke requests pending</p>
                  </div>
               )}
            </div>
         </div>
      </DashboardLayout>
   );
};

export default ArtisanDashboard;
