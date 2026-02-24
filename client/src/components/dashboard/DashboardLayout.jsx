
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-white">
            <DashboardSidebar />
            <div className="flex-1 md:ml-64 overflow-y-auto w-full">
                <main className="min-h-screen py-8 px-6 md:px-12 relative max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
