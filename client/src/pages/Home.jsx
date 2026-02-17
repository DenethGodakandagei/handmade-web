import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import productService from '@/api/services/productService';
import { Button } from '@/components/ui/button';

const Home = () => {
   const [products, setProducts] = useState([]);
   const { scrollYProgress } = useScroll();
   const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const res = await productService.getAll({ limit: 3 }); // Fetch a few for the home page
            // The API returns { success: true, data: { products: [], ... } } or just the products array depending on interceptor
            // Based on Products.jsx: res.data.products || res.data
            const data = res.data.products || res.data;
            setProducts(data);
         } catch (error) {
            console.error("Failed to fetch products for home page", error);
         }
      };

      fetchProducts();
   }, []);

   return (
      <div className="bg-white min-h-screen font-sans text-[#111] selection:bg-black selection:text-white">

         {/* Hero: Ultra Minimal */}
         <section className="relative h-screen flex flex-col justify-between p-6 md:p-12">
            <div className="flex justify-between items-start">
               <span className="text-xs font-medium tracking-[0.05em] uppercase">Est. 1893</span>

            </div>

            <div className="flex flex-col items-center justify-center flex-grow text-center space-y-8 z-10">
               <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[12vw] leading-[0.85] tracking-tighter font-medium"
               >
                  ARTISAN.
               </motion.h1>
               <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="max-w-md text-sm md:text-base font-light text-gray-500"
               >
                  A quiet celebration of the handmade. <br />
                  Objects of permanence for modern living.
               </motion.p>
            </div>

            <div className="w-full relative h-[40vh] md:h-[50vh] overflow-hidden rounded-sm">
               <motion.img
                  style={{ y }}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5 }}
                  src="/images/hero.png"
                  className="w-full h-full object-cover grayscale-[20%]"
                  alt="Hero"
               />
               <div className="absolute inset-0 bg-black/5" />
               <div className="absolute bottom-6 left-6 p-6">
                  <Button asChild variant="link" className="text-white text-xs uppercase tracking-widest hover:text-white/80 p-0 h-auto">
                     <Link to="/collection">Explore Collection <ArrowRight className="ml-2 w-3 h-3" /></Link>
                  </Button>
               </div>
            </div>
         </section>

         {/* Philosophy: Architectural Layout */}
         <section className="py-32 px-6 md:px-12 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
               <div className="md:col-span-4">
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-gray-400">The/Philosophy</span>
               </div>
               <div className="md:col-span-8 space-y-12">
                  <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.1] font-light">
                     We believe in the beauty of the <span className="italic font-serif">imperfect</span>.
                     Objects that bear the mark of the hand that made them.
                  </h2>
                  <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                     <div>
                        <span className="block text-3xl font-light mb-2">01</span>
                        <p className="text-sm text-gray-500 max-w-[200px]">Ethically sourced from independent studios worldwide.</p>
                     </div>
                     <div>
                        <span className="block text-3xl font-light mb-2">02</span>
                        <p className="text-sm text-gray-500 max-w-[200px]">Certified authentic lineage for every artifact.</p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Editorial Grid: Staggered */}
         <section className="pb-32 px-6 md:px-12">
            <div className="flex justify-between items-end mb-20">
               <h3 className="text-xl tracking-tight">Selected Works</h3>
               <Link to="/collection" className="text-xs uppercase tracking-widest hover:underline underline-offset-4 decoration-1">
                  View All
               </Link>
            </div>

            <motion.div
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-20"
               initial="hidden"
               whileInView="show"
               viewport={{ once: true, margin: "-10%" }}
               variants={{
                  hidden: { opacity: 0 },
                  show: {
                     opacity: 1,
                     transition: {
                        staggerChildren: 0.2,
                        delayChildren: 0.1
                     }
                  }
               }}
            >
               {products.map((product, i) => (
                  <motion.div
                     key={product._id}
                     className={`group ${i === 1 ? 'md:translate-y-20' : ''}`}
                     variants={{
                        hidden: { opacity: 0, y: 100 },
                        show: {
                           opacity: 1,
                           y: 0,
                           transition: {
                              duration: 0.8,
                              ease: [0.25, 0.46, 0.45, 0.94]
                           }
                        }
                     }}
                  >
                     <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-6 relative">
                        <img
                           src={product.images?.[0]}
                           alt={product.name}
                           className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-500" />
                     </div>
                     <div className="flex flex-col space-y-1">
                        <div className="flex justify-between items-baseline">
                           <Link to={`/collection/${product._id}`}>
                              <h4 className="text-lg font-medium tracking-tight group-hover:text-gray-600 transition-colors">{product.name}</h4>
                           </Link>
                           <span className="text-sm font-light text-gray-500">${product.price}</span>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-gray-400">{product.category?.name}</p>
                     </div>
                  </motion.div>
               ))}
            </motion.div>
         </section>

         {/* Minimal Footer Area */}
         <section className="py-24 px-6 md:px-12 bg-gray-50 mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
               <h2 className="text-4xl md:text-5xl tracking-tight max-w-md">
                  Join our list for early access.
               </h2>
               <div className="flex border-b border-black/10 hover:border-black transition-colors pb-4">
                  <input
                     type="email"
                     placeholder="Email Address"
                     className="bg-transparent border-none outline-none w-full placeholder:text-gray-400"
                  />
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
               </div>
            </div>
         </section>

      </div>
   );
};

export default Home;
