import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';

const OrderSuccess = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Acquisition Complete | Thank You";
        // Trigger confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            // Generate confetti from two points
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans mt-0 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500 delay-150">
                <Check className="w-12 h-12 text-green-500" strokeWidth={2.5} />
            </div>
            
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 block">Order Confirmed</span>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-6">
                Thank you for your acquisition.
            </h1>
            
            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed mb-12 font-light">
                Your order has been successfully placed. We have sent a confirmation email with your order details and tracking information.
            </p>

            <button 
                onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => navigate('/products', { replace: true }), 800);
                }}
                disabled={isLoading}
                className="bg-black text-white w-64 h-14 text-xs uppercase tracking-[0.2em] font-bold hover:bg-gray-800 transition-all inline-flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
                {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Return to Collection'
                )}
            </button>
        </div>
    );
};

export default OrderSuccess;
