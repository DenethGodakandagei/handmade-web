import React, { useState, useEffect } from 'react';
import { Zap, Search, RefreshCcw, PackageCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import orderService from '../../api/services/orderService';
import DataTable from '../../components/DataTable';
import Spinner from '@/components/ui/Spinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAll();
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch pulse log');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Fulfillment protocol updated to ${newStatus.toUpperCase()}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update fulfillment status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) || 
    o.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const StatusSelector = ({ order }) => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    return (
      <select 
        className="bg-transparent border border-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest p-1 cursor-pointer focus:outline-none focus:border-primary/50"
        value={order.status}
        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
      >
        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    );
  };

  const orderColumns = [
    { 
      key: '_id', 
      label: 'TRANSACTION ID', 
      render: (val, row) => (
        <div className="space-y-1">
           <p className="font-black text-[10px] uppercase tracking-tighter">{val.substring(0,8)}...</p>
           <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{new Date(row.createdAt).toLocaleString()}</p>
        </div>
      )
    },
    { 
      key: 'user', 
      label: 'IDENTITY', 
      render: (val) => (
        <span className="text-xs font-bold">{val?.name || 'Unknown User'}</span>
      )
    },
    { 
      key: 'totalPrice', 
      label: 'VOLUME',
      render: (val) => <span className="text-xs font-black tracking-tighter">${(val || 0).toFixed(2)}</span>
    },
    { 
      key: 'paymentStatus', 
      label: 'LEDGER',
      render: (val) => (
        <Badge variant="outline" className={`text-[8px] h-5 px-3 uppercase tracking-widest font-black border-none ${val === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'status', 
      label: 'FULFILLMENT',
      render: (_, row) => <StatusSelector order={row} />
    }
  ];

  if (loading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
              <Spinner />
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
              <h1 className="text-3xl font-light tracking-tight text-black">Transaction Tracker</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">View Pulse Log</p>
          </div>
          <Button
              onClick={fetchOrders}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
          >
              <RefreshCcw size={16} className="mr-2" />
              Sync Pulse
          </Button>
      </header>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                  placeholder="SEARCH PULSE..."
                  className="w-full bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <DataTable 
          columns={orderColumns} 
          data={filteredOrders} 
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default AdminOrders;
