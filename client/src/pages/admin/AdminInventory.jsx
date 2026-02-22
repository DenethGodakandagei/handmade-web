import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle2, ShoppingBag, RefreshCcw, Search, Edit3, Box, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const AdminInventory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/inventory');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleUpdateStock = async (id) => {
    try {
      const stockVal = parseInt(editStock);
      if (isNaN(stockVal) || stockVal < 0) {
        toast.error('Invalid stock value');
        return;
      }
      await api.put(`/admin/inventory/${id}`, { stock: stockVal });
      toast.success('Stock updated');
      setEditingId(null);
      setEditStock('');
      fetchInventory();
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  const { products, alerts, totals } = data || {};

  const filteredProducts = (products || []).filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'out') return matchesSearch && p.stock === 0 && !p.isPreOrder;
    if (filter === 'low') return matchesSearch && p.stock > 0 && p.stock <= 5;
    if (filter === 'healthy') return matchesSearch && p.stock > 5;
    if (filter === 'preorder') return matchesSearch && p.isPreOrder;
    return matchesSearch;
  });

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Inventory Control</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Stock-Level Monitor & Replenishment Alerts</p>
        </div>
        <Button onClick={fetchInventory} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </header>

      {/* Alert Overview */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <Box className="w-3.5 h-3.5 text-black" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Total Products</span>
          </div>
          <p className="text-3xl font-light tracking-tighter">{totals?.totalProducts || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="border border-gray-200 p-5 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Total Units</span>
          </div>
          <p className="text-3xl font-light tracking-tighter">{totals?.totalUnits || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="border border-red-200 p-5 bg-red-50/30 space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-400">Out of Stock</span>
          </div>
          <p className="text-3xl font-light tracking-tighter text-red-600">{alerts?.outOfStock || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="border border-yellow-200 p-5 bg-yellow-50/30 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-yellow-600">Low Stock</span>
          </div>
          <p className="text-3xl font-light tracking-tighter text-yellow-600">{alerts?.lowStock || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="border border-green-200 p-5 bg-green-50/30 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-600">Healthy</span>
          </div>
          <p className="text-3xl font-light tracking-tighter text-green-600">{alerts?.healthy || 0}</p>
        </motion.div>
      </section>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all', 'All'], ['out', 'Out of Stock'], ['low', 'Low Stock'], ['healthy', 'Healthy'], ['preorder', 'Pre-Order']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 border transition-colors ${filter === key ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Product</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Artisan</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Category</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Price</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Stock</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Status</th>
                <th className="text-left text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const isOut = p.stock === 0 && !p.isPreOrder;
                const isLow = p.stock > 0 && p.stock <= 5;
                return (
                  <tr key={p._id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isOut ? 'bg-red-50/30' : isLow ? 'bg-yellow-50/20' : ''}`}>
                    <td className="p-4">
                      <p className="text-sm font-bold text-black truncate max-w-[200px]">{p.name}</p>
                    </td>
                    <td className="p-4 text-xs text-gray-600">{p.artisan?.studioName || p.artisan?.name || '—'}</td>
                    <td className="p-4 text-xs text-gray-500 uppercase tracking-widest">{p.category?.name || '—'}</td>
                    <td className="p-4 text-sm font-mono font-bold">${p.price?.toFixed(2)}</td>
                    <td className="p-4">
                      {editingId === p._id ? (
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={e => setEditStock(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateStock(p._id)}
                          className="w-20 px-2 py-1 border border-black text-sm font-mono focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-sm font-mono font-bold ${isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-black'}`}>{p.stock}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {p.isPreOrder ? (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1">Pre-Order</span>
                      ) : isOut ? (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1">Depleted</span>
                      ) : isLow ? (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-1">Critical</span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1">Nominal</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === p._id ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateStock(p._id)} className="text-[10px] uppercase tracking-widest font-bold bg-black text-white px-3 py-1.5 hover:bg-gray-800">Save</button>
                          <button onClick={() => { setEditingId(null); setEditStock(''); }} className="text-[10px] uppercase tracking-widest font-bold border border-gray-200 px-3 py-1.5 hover:bg-gray-50">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(p._id); setEditStock(String(p.stock)); }} className="text-gray-400 hover:text-black transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-400 italic">No products match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};

export default AdminInventory;
