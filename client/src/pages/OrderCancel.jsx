import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const OrderCancel = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = "Payment Declined | Artisan";
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans mt-0 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500 delay-150">
                <X className="w-12 h-12 text-red-500" strokeWidth={2.5} />
            </div>
            
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 block">Payment Cancelled</span>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-6">
                Order not processed.
            </h1>
            
            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed mb-12 font-light">
                Your payment was cancelled or declined. No charges were made to your account. You can return to your cart to try again.
            </p>

            <button 
                onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => navigate('/cart', { replace: true }), 800);
                }}
                disabled={isLoading}
                className="bg-black text-white w-64 h-14 text-xs uppercase tracking-[0.2em] font-bold hover:bg-gray-800 transition-all inline-flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
                 {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Return to Cart'
                )}
            </button>
        </div>
    );
};

export default OrderCancel;
