import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Package, Truck, 
  ChevronRight, Calendar, DollarSign, 
  Search, SlidersHorizontal, ArrowUpRight,
  ShieldCheck, Info, MapPin, Hammer
} from 'lucide-react';
import orderService from '../api/services/orderService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-600';
      case 'Shipped': return 'bg-blue-50 text-blue-600';
      case 'Processing': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-16 pb-32">
      <div className="container mx-auto px-6">
        {/* Header - Collector Archives Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 space-y-8 md:space-y-0 relative">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 text-primary mb-6">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Collector Provenance</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.85] text-balance">The Gallery <br /><span className="text-primary italic font-light italic">Treasury.</span></h1>
            <p className="text-gray-500 font-light text-xl">An authenticated log of your acquisitions and the lineage of your collection.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-2xl shadow-black/5 border border-gray-50">
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="LOCATE SEQUENCE..." 
                  className="bg-transparent pl-14 pr-8 py-4 focus:outline-none w-[280px] text-[10px] font-black uppercase tracking-[0.2em]"
                />
             </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-10">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-[3.5rem] bg-white border border-gray-50" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-12">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[3.5rem] overflow-hidden border border-gray-50 shadow-2xl shadow-black/5 flex flex-col lg:flex-row items-stretch group"
                >
                   {/* Sequence ID Label */}
                   <div className="lg:w-72 bg-gray-50/50 p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-700">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-40">Artifact Sequence</p>
                         <h3 className="text-3xl font-black tracking-tighter">#{order._id.slice(-6).toUpperCase()}</h3>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center space-x-3">
                            <Calendar size={14} className="opacity-40" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                         </div>
                         <Badge className={`rounded-full px-5 py-2 text-[9px] font-black uppercase tracking-widest border-none ${getStatusStyle(order.status)}`}>
                            {order.status}
                         </Badge>
                      </div>
                   </div>

                   {/* Order Content */}
                   <div className="flex-grow p-10 lg:p-12 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                         {order.products?.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-6">
                               <div className="w-20 h-24 bg-gray-50 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all border border-gray-100 shrink-0">
                                  <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                               </div>
                               <div className="space-y-2">
                                  <p className="font-black text-sm uppercase tracking-tighter truncate max-w-[120px]">{item.product?.name}</p>
                                  <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                     <MapPin size={10} className="mr-1 text-primary" />
                                     <span>{item.product?.location?.area}</span>
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-300">QTY: {item.quantity}</p>
                               </div>
                            </div>
                         ))}
                      </div>

                      <div className="pt-10 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-8">
                         <div className="flex items-center gap-12">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">Total valuation</span>
                               <span className="text-3xl font-black tracking-tighter">${order.totalAmount}</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">Origin Node</span>
                               <div className="flex items-center space-x-2">
                                  <Hammer size={12} className="text-primary" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{order.products?.[0]?.product?.artisan?.name || 'Village Workshop'}</span>
                               </div>
                            </div>
                         </div>
                         <Button variant="outline" className="rounded-full px-8 h-14 border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all group/btn">
                            Detailed Manifest
                            <ArrowUpRight size={14} className="ml-3 group-hover/btn:rotate-45 transition-transform" />
                         </Button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-40 text-center bg-white rounded-[5rem] border border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10 text-gray-200">
               <ShoppingBag size={48} />
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-6">Treasury is Empty</h2>
            <p className="text-gray-400 font-light text-xl mb-12 max-w-md mx-auto">Your heritage collection has not yet begun. The archives await your first acquisition.</p>
            <Button asChild className="btn-artisan h-16 px-12 rounded-full shadow-3xl shadow-primary/30">
               <Link to="/products">Establish Lineage</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
