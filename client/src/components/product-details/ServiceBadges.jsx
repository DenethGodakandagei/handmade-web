import React from 'react';
import { Truck, Shield } from 'lucide-react';

const ServiceBadges = () => {
    return (
        <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 mt-10">
            <div className="bg-white p-6 flex flex-col gap-3">
                <Truck size={16} className="text-black" strokeWidth={1.5} />
                <div>
                   <h5 className="text-[10px] font-bold uppercase tracking-widest mb-1 text-black">Global Shipping</h5>
                   <p className="text-[10px] text-gray-400">Secure delivery to 45+ countries.</p>
                </div>
            </div>
            <div className="bg-white p-6 flex flex-col gap-3">
                <Shield size={16} className="text-black" strokeWidth={1.5} />
                <div>
                   <h5 className="text-[10px] font-bold uppercase tracking-widest mb-1 text-black">Authenticity</h5>
                   <p className="text-[10px] text-gray-400">Verified Artisan Craftsmanship.</p>
                </div>
            </div>
        </div>
    );
};

export default ServiceBadges;
