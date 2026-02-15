
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';

const Storefront = () => {
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
            <header className="flex justify-between items-end border-b border-gray-100 pb-6">
                 <div>
                     <h1 className="text-3xl font-light tracking-tight text-black">Storefront</h1>
                </div>
                 <button className="bg-white border border-gray-200 text-black px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors">
                    View Live
                </button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64 border bg-gray-50 border-gray-100 rounded-lg p-8">
                    <p className="text-xs uppercase tracking-widest font-bold mb-4">Branding</p>
                    <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                     <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="h-64 border bg-gray-50 border-gray-100 rounded-lg p-8">
                    <p className="text-xs uppercase tracking-widest font-bold mb-4">Featured Image</p>
                     <div className="h-32 w-full bg-gray-200 rounded"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default Storefront;
