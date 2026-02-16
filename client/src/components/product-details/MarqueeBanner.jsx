import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';

const MarqueeBanner = () => {
  const marqueeX = useMotionValue(0);
  const [marqueeSpeed, setMarqueeSpeed] = useState(0.5); // Normal speed
  const marqueeContentRef = useRef(null);

  useAnimationFrame((t, delta) => {
      if (!marqueeContentRef.current) return;
      
      const contentWidth = marqueeContentRef.current.scrollWidth / 2; // split due to duplication
      let newX = marqueeX.get() - (marqueeSpeed * (delta / 16)); // Frame-rate independent

      if (Math.abs(newX) >= contentWidth) {
          newX = 0; // Wrap around smoothly
      }
      marqueeX.set(newX);
  });

  return (
        <div className="overflow-hidden border-t border-b border-gray-100 py-4 my-20 bg-gray-50 flex"
             onMouseEnter={() => setMarqueeSpeed(0.1)}  // Slow down
             onMouseLeave={() => setMarqueeSpeed(0.5)}  // Resume
        >
           <motion.div 
             ref={marqueeContentRef}
             style={{ x: marqueeX }}
             className="whitespace-nowrap flex gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400"
           >
              {/* Duplicate content enough times to allow seamless loop */}
              {[...Array(10)].map((_, i) => (
                 <span key={`a-${i}`}>Authentic • Handmade • Ethically Sourced • Globally Shipped • </span>
              ))}
              {[...Array(10)].map((_, i) => (
                 <span key={`b-${i}`}>Authentic • Handmade • Ethically Sourced • Globally Shipped • </span>
              ))}
           </motion.div>
        </div>
  );
};

export default MarqueeBanner;
