import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Star } from 'lucide-react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Spinner from '@/components/ui/Spinner';
import orderService from '@/api/services/orderService';
import customizationService from '@/api/services/customizationService';

const UserOverview = () => {
    const { user } = useAuth();
    const { items } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    
    // Statistics state
    const [stats, setStats] = useState({
        totalOrders: 0,
        shippedOrders: 0,
        totalCustomizations: 0,
        pendingCustomizations: 0,
    });

    // Cart calculations (for Saved Items)
    const validItems = Array.isArray(items) ? items.filter(item => item && item.product) : [];
    const totalCartItems = validItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                // Execute API calls in parallel
                const [ordersRes, customizationsRes] = await Promise.all([
                    orderService.getMyOrders(),
                    customizationService.getAll()
                ]);

                const orders = (ordersRes.data?.data || ordersRes.data || []);
                const customizations = (customizationsRes.data?.data || customizationsRes.data || []);

                setStats({
                    totalOrders: orders.length,
                    shippedOrders: orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length,
                    totalCustomizations: customizations.length,
                    pendingCustomizations: customizations.filter(c => c.status === 'Pending' || c.status === 'Accepted').length,
                });
            } catch (err) {
                console.error("Failed to fetch user overview data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <DashboardHeader title="Overview" subtitle={`Welcome to your personal archive, ${user?.name?.split(' ')[0] || 'User'}.`} />

            <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 border border-gray-100 p-8 rounded-2xl bg-white"
                >
                    <div className="flex items-center gap-2">
                         <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Total Orders</h3>
                         <ShoppingBag className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-6xl font-light tracking-tighter text-black">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-400 tracking-wide">{stats.shippedOrders} shipped or delivered</p>
                </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 border border-gray-100 p-8 rounded-2xl bg-white"
                >
                    <div className="flex items-center gap-2">
                         <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Customizations</h3>
                         <Sparkles className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-6xl font-light tracking-tighter text-black">{stats.totalCustomizations}</p>
                    <p className="text-xs text-gray-400 tracking-wide">{stats.pendingCustomizations} pending execution</p>
                </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4 border border-gray-100 p-8 rounded-2xl bg-white"
                >
                    <div className="flex items-center gap-2">
                         <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Cart Cache</h3>
                         <Star className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-6xl font-light tracking-tighter text-black">{totalCartItems}</p>
                    <p className="text-xs text-gray-400 tracking-wide">Waiting in your collection</p>
                </motion.div>
            </section>
        </div>
    );
};

export default UserOverview;
