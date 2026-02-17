import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import productService from '@/api/services/productService';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Products = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products for the current artisan
                const res = await productService.getAll({ artisan: user._id });
                setProducts(res.data.products || res.data); // Handle potential response structure variations
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchProducts();
        }
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.delete(id);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                console.error("Failed to delete product", error);
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
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                    {val && val.length > 0 ? (
                        <img src={val[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
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
                    <p className="font-bold text-sm text-gray-900">{val}</p>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-black" onClick={() => navigate(`/dashboard/products/edit/${row._id}`)}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(row._id)}>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-black">Product Collection</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Manage your catalog and inventory</p>
                </div>
                <Button
                    onClick={() => navigate('/dashboard/products/add')}
                    className="bg-black text-white hover:bg-gray-800 rounded-full px-6 btn-premium"
                >
                    <Plus size={16} className="mr-2" />
                    New Creation
                </Button>
            </header>

            {/* Filters */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Search products..."
                        className="pl-11 bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="rounded-xl border-gray-100">
                    <Filter size={16} className="text-gray-500" />
                </Button>
            </div>

            {/* Products Table or Empty State */}
            {filteredProducts.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filteredProducts}
                        isLoading={isLoading}
                    />
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[2rem] space-y-4 bg-gray-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Search size={24} className="text-gray-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                        <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Try adjusting your search or add a new product</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Products;
