
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

const Customizations = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
                <Spinner />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <DashboardHeader title="Customizations" subtitle="" />
            
            <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg space-y-2">
                <h3 className="text-xl font-medium text-black">No customizations Orders</h3>
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-bold">When you receive an order, it will appear here.</p>
            </div>
        </motion.div>
    );
};

export default Customizations;
