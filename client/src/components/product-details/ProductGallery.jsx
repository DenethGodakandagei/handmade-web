import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductGallery = ({ product }) => {
    const [activeImage, setActiveImage] = useState(0);
    const [zoomProps, setZoomProps] = useState({ x: 0, y: 0, show: false });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomProps({ x, y, show: true });
    };

    const handleMouseLeave = () => {
        setZoomProps({ ...zoomProps, show: false });
    };

    return (
        <div className="lg:col-span-6 space-y-6 sticky top-32">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="aspect-square bg-gray-50 overflow-hidden relative group cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={product.images?.[activeImage]} 
                  alt={product.name} 
                  style={{
                    transformOrigin: `${zoomProps.x}% ${zoomProps.y}%`,
                    transform: zoomProps.show ? 'scale(2)' : 'scale(1)',
                  }}
                  className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-transform duration-100 ease-out contrast-[1.02]"
                />
              </AnimatePresence>
            </motion.div>
            
            {/* Thumbnails - Sharp Squares */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
              {product.images?.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 flex-shrink-0 overflow-hidden transition-all duration-300 border ${activeImage === i ? 'border-gray-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
        </div>
    );
};

export default ProductGallery;
