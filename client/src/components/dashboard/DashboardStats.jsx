
import React from 'react';

const DashboardStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {/* Stats */}
            <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-bold">Total Sales</h3>
                <p className="text-6xl font-light tracking-tighter">$0.00</p>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Lifetime earnings
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-bold">Active Listings</h3>
                <p className="text-6xl font-light tracking-tighter">0</p>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Visible products
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-bold">Pending Orders</h3>
                <p className="text-6xl font-light tracking-tighter">0</p>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Awaiting fulfillment
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
