
import React from 'react';

const DashboardHeader = ({ title = "Overview", subtitle = "" }) => {
    return (
        <header className="mb-12 flex justify-between items-end border-b border-gray-100 pb-6">
            <div>
                 <h1 className="text-3xl font-light tracking-tight text-black">{title}</h1>
                 {subtitle && (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">{subtitle}</p>
                 )}
            </div>
            <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </header>
    );
};

export default DashboardHeader;
