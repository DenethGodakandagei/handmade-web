import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-white text-black py-20 border-t border-gray-100">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 text-sm font-light">
        
        <div className="col-span-2">
           <h3 className="font-medium tracking-tight text-lg mb-6">ARTISAN.</h3>
           <p className="text-gray-400 max-w-xs leading-relaxed">
              Global collection of handmade artifacts. <br />
              <span className="text-[10px] uppercase tracking-widest mt-4 block">Est. 1893</span>
           </p>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Shop</h4>
           <Link to="/products" className="block hover:underline underline-offset-4 decoration-1">All Arrivals</Link>
           <Link to="/products?category=Ceramics" className="block hover:underline underline-offset-4 decoration-1">Ceramics</Link>
           <Link to="/products?category=Furniture" className="block hover:underline underline-offset-4 decoration-1">Furniture</Link>
           <Link to="/products?category=Textile" className="block hover:underline underline-offset-4 decoration-1">Textile</Link>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">About</h4>
           <Link to="/about" className="block hover:underline underline-offset-4 decoration-1">Philosophy</Link>
           <Link to="/artisans" className="block hover:underline underline-offset-4 decoration-1">The Makers</Link>
           <Link to="/sustainability" className="block hover:underline underline-offset-4 decoration-1">Impact</Link>
           <Link to="/journal" className="block hover:underline underline-offset-4 decoration-1">Journal</Link>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Legal</h4>
           <Link to="/terms" className="block hover:underline underline-offset-4 decoration-1">Terms</Link>
           <Link to="/privacy" className="block hover:underline underline-offset-4 decoration-1">Privacy</Link>
           <Link to="/shipping" className="block hover:underline underline-offset-4 decoration-1">Shipping</Link>
           <Link to="/returns" className="block hover:underline underline-offset-4 decoration-1">Returns</Link>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Connect</h4>
           <a href="#" className="flex items-center gap-1 hover:underline underline-offset-4 decoration-1 group">
              Instagram <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
           </a>
           <a href="#" className="flex items-center gap-1 hover:underline underline-offset-4 decoration-1 group">
              Twitter <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
           </a>
           <a href="#" className="flex items-center gap-1 hover:underline underline-offset-4 decoration-1 group">
              Email <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
           </a>
        </div>

      </div>
      
      <div className="w-full text-center mt-32 border-t border-gray-50 pt-20 pb-12 overflow-hidden">
         <motion.h1 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-[22vw] leading-[0.8] font-medium tracking-tighter text-black/5 select-none pointer-events-none translate-y-8 flex justify-center"
            variants={{
               hidden: { opacity: 0 },
               show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.2 }
               }
            }}
         >
            {Array.from("ARTISAN.").map((char, i) => (
               <motion.span
                  key={i}
                  variants={{
                     hidden: { y: "100%" },
                     show: { y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
                  }}
                  className="inline-block"
               >
                  {char}
               </motion.span>
            ))}
         </motion.h1>
      </div>

      <div className="container mx-auto px-6 md:px-12 flex justify-between items-end border-t border-gray-50 pt-8 pb-8">
         <span className="text-[10px] text-gray-300 uppercase tracking-widest">© 2026 Artisan Inc.</span>
         <span className="text-[10px] text-gray-300 uppercase tracking-widest">Kyoto • New York • Copenhagen</span>
      </div>
    </footer>
  );
};

export default Footer;
