
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Plus, Package, CreditCard, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import customizationService from '../api/services/customizationService';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const UserDashboard = () => {
    const [requests, setRequests] = useState([]);

    const navigate = useNavigate();
    const { clearCart, addToCart } = useCart();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await customizationService.getAll();
                setRequests(res.data || []);
            } catch (err) {
                console.error("Failed to fetch requests", err);
            }
        };
        fetchRequests();
    }, []);

    const handleCheckoutCustomRequest = (req) => {
        clearCart();
        const customProduct = {
            _id: req.product?._id, // Use original product ID but fake everything else if needed
            name: `Custom Commission: ${req.product?.name}`,
            price: req.price || req.product?.price || 0,
            images: req.product?.images || [],
            artisan: req.product?.artisan,
            stock: 1,
            customizationRequestId: req._id
        };
        addToCart(customProduct, 1);
        navigate('/checkout');
    };
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <DashboardHeader title="My Account" subtitle="Manage your orders and requests" />

            {/* Quick Actions */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-1 gap-12 pt-6"
            >
                <div>
                    <h3 className="text-2xl font-light mb-8">My Custom Requests.</h3>
                    <div className="space-y-4">
                        {requests.length > 0 ? (
                            requests.map((req) => (
                                <div key={req._id} className="p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                                                {req.product?.images?.[0] && <img src={req.product.images[0]} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm uppercase tracking-wider">{req.product?.name}</h4>
                                                <p className="text-xs text-gray-400">Request ID: #{req._id.slice(-4)}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`uppercase text-[10px] tracking-widest ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            req.status === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                                                req.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                            {req.status}
                                        </Badge>
                                    </div>
                                    <div className="pl-16 space-y-2 mt-4">
                                        {req.customizations?.slice(0, 2).map((c, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-gray-400">{c.optionName}</span>
                                                <span className="font-medium">{c.selectedValue}</span>
                                            </div>
                                        ))}
                                        {req.status === 'Accepted' && (
                                            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Agreed Price</p>
                                                    <p className="text-lg font-light tracking-tight">${req.price || req.product?.price}</p>
                                                </div>
                                                {!req.isPaid ? (
                                                    <Button
                                                        onClick={() => handleCheckoutCustomRequest(req)}
                                                        className="h-10 px-6 bg-black text-white hover:bg-gray-800 rounded-lg text-[10px] uppercase font-bold tracking-widest"
                                                    >
                                                        <CreditCard size={14} className="mr-2" /> Pay & Provide Shipping
                                                    </Button>
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 h-10 px-6 rounded-lg uppercase tracking-widest flex items-center border-none font-bold">
                                                        <CheckCircle size={14} className="mr-2" /> Paid
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg text-center p-6">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Package className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">No active requests</p>
                                <p className="text-gray-300 text-[10px]">Start a custom order from any product page</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-light">My Orders.</h3>
                    </div>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full md:w-auto h-16 border-gray-200 text-black hover:bg-gray-50 rounded-none uppercase tracking-[0.2em] px-12 text-xs font-bold transition-all" onClick={() => window.location.href = '/dashboard/orders'}>
                            View Order History <ArrowUpRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default UserDashboard;
