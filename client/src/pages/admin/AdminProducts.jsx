import React, { useState, useEffect } from 'react';
import { Database, Search, RefreshCcw, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import productService from '../../api/services/productService';
import DataTable from '../../components/DataTable';
import Spinner from '@/components/ui/Spinner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll({ limit: 1000 });
      const productsArray = Array.isArray(res.data) ? res.data : (res.data?.products || []);
      setProducts(productsArray);
    } catch (err) {
      toast.error('Failed to fetch archive control');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to permanently delete '${product.name}'?`)) {
      try {
        await productService.delete(product._id);
        toast.success('Object permanently removed from archives');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete object');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.artisan?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const productColumns = [
    { 
      key: 'images', 
      label: 'VISUAL', 
      render: (val) => (
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-[8px] text-gray-400 overflow-hidden border border-gray-100 uppercase tracking-widest">
           {val && val.length > 0 ? (
             <img src={val[0]} alt="" className="w-full h-full object-cover" />
           ) : (
             'NO IMG'
           )}
        </div>
      )
    },
    { 
      key: 'name', 
      label: 'OBJECT NAME', 
      render: (val, row) => (
        <div className="space-y-1">
           <p className="font-black text-sm uppercase tracking-tighter">{val}</p>
           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{row.category?.name || 'Unclassified'}</p>
        </div>
      )
    },
    { 
      key: 'price', 
      label: 'VALUE',
      render: (val) => <span className="text-xs font-black tracking-tighter">${(val || 0).toFixed(2)}</span>
    },
    { 
      key: 'artisan', 
      label: 'CREATOR',
      render: (val) => (
        <Badge variant="outline" className="text-[8px] h-5 px-3 uppercase tracking-widest font-black border-none bg-primary/10 text-primary">
          {val?.name || 'Unknown'}
        </Badge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'CATALOG TIMESTAMP',
      render: (val) => (
        <div className="space-y-1">
          <span className="block text-[10px] text-gray-900 font-black uppercase tracking-widest">{new Date(val).toLocaleDateString()}</span>
          <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">{new Date(val).toLocaleTimeString()}</span>
        </div>
      )
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
              <h1 className="text-3xl font-light tracking-tight text-black">Archive Control</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Master Object Inventory</p>
          </div>
          <Button
              onClick={fetchProducts}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
          >
              <RefreshCcw size={16} className="mr-2" />
              Sync Archive
          </Button>
      </header>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                  placeholder="SEARCH ARCHIVES..."
                  className="w-full bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>
      </div>

      {filteredProducts.length > 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
              <DataTable 
                columns={productColumns} 
                data={filteredProducts} 
                isLoading={loading}
                onDelete={handleDelete}
              />
          </div>
      ) : (
          <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[2rem] space-y-4 bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Database size={24} className="text-gray-300" />
              </div>
              <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">No objects found</h3>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Try adjusting your search</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminProducts;
