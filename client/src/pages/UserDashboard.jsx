
import React from 'react';
import useAuthStore from '../store/authStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <DashboardHeader />
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <DashboardStats />
            </motion.div>

            {/* Quick Actions */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-12"
            >
                <div>
                   <h3 className="text-2xl font-light mb-8">Recent Activity.</h3>
                   <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 rounded-lg">
                      <p className="text-gray-400 text-xs uppercase tracking-widest">No recent orders</p>
                   </div>
                </div>

                <div>
                   <h3 className="text-2xl font-light mb-8">Quick Actions.</h3>
                   <div className="space-y-4">
                      <Button className="w-full justify-between h-16 bg-black text-white hover:bg-gray-900 rounded-none uppercase tracking-[0.2em] px-8 text-xs font-bold transition-all">
                         Add New Product <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full justify-between h-16 border-gray-200 text-black hover:bg-gray-50 rounded-none uppercase tracking-[0.2em] px-8 text-xs font-bold transition-all">
                         View My Storefront <ArrowUpRight className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full justify-between h-16 border-gray-200 text-black hover:bg-gray-50 rounded-none uppercase tracking-[0.2em] px-8 text-xs font-bold transition-all">
                         Update Studio Profile <ArrowUpRight className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
            </motion.section>
        </div>
    );
};

export default UserDashboard;
