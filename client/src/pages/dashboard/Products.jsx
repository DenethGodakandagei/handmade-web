import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import productService from '@/api/services/productService';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Products = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, fetchMe } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProducts = useCallback(async () => {
        if (!user?._id) return;
        try {
            setIsLoading(true);
            const res = await productService.getAll({ artisan: user._id, noCache: true });
            setProducts(res.data.products || res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // If user exists but _id is missing, refresh user data from server
        if (user && !user._id) {
            fetchMe();
        }
    }, [user, fetchMe]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, location.key]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.delete(id);
                setProducts(prev => prev.filter(p => p._id !== id));
                toast.success('Product deleted successfully');
            } catch (error) {
                console.error("Failed to delete product", error);
                toast.error('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'images',
            label: 'Image',
            render: (val) => (
                <div className="w-12 h-12 overflow-hidden border border-gray-100 rounded-lg bg-gray-50">
                    {val && val.length > 0 ? (
                        <img src={val[0]} alt="" className="object-cover w-full h-full" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-300">
                            <span className="text-[8px]">NO IMG</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'name',
            label: 'Product Name',
            render: (val, row) => (
                <div>
                    <p className="text-sm font-bold text-gray-900">{val}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{row.category?.name || 'Uncategorized'}</p>
                </div>
            )
        },
        {
            key: 'price',
            label: 'Price',
            render: (val) => <span className="font-medium">${val.toFixed(2)}</span>
        },
        {
            key: 'stock',
            label: 'Stock',
            render: (val) => (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${val > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {val > 0 ? `${val} In Stock` : 'Out of Stock'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-black" onClick={() => navigate(`/dashboard/products/edit/${row._id}`)}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(row._id)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
                <Spinner />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20 space-y-8">
            <header className="flex flex-col justify-between gap-6 pb-8 border-b border-gray-100 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-black">Product Collection</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Manage your catalog and inventory</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" size={14} />
                        <Input
                            placeholder="Search products..."
                            className="w-56 h-10 text-sm transition-all border-gray-100 rounded-lg pl-9 bg-gray-50 focus:bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard/products/add')}
                        className="px-6 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors bg-black rounded-none hover:bg-gray-800"
                    >
                        <Plus size={16} className="mr-2" />
                        New Creation
                    </Button>
                </div>
            </header>

            {/* Products Table or Empty State */}
            {filteredProducts.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filteredProducts}
                        isLoading={isLoading}
                        hideSearch
                    />
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[2rem] space-y-4 bg-gray-50/50">
                    <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm">
                        <Search size={24} className="text-gray-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                        <p className="mt-1 text-xs tracking-widest text-gray-400 uppercase">Try adjusting your search or add a new product</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Products;
