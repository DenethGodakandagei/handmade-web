import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuSeparator,
   DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import productService from '@/api/services/productService'; // Added import

const ProductList = () => {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);

   // Filters State
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('All');
   const [priceRange, setPriceRange] = useState('all');
   const [sortBy, setSortBy] = useState('newest');

   // Fetch products
   useEffect(() => {
      const fetchProducts = async () => {
         try {
            setLoading(true);
            const res = await productService.getAll({ limit: 100 }); // Fetch sufficient products for client-side filtering
            const data = res.data.products || res.data;
            setProducts(data);
         } catch (error) {
            console.error("Failed to fetch products", error);
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   const categories = ['All', 'Ceramics', 'Textile', 'Woodwork', 'Metal', 'Glass', 'Leather'];

   // Filter Logic
   const filteredProducts = useMemo(() => {
      let result = [...products];

      // Search
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         result = result.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.category?.name?.toLowerCase().includes(q)
         );
      }

      // Category
      if (selectedCategory !== 'All') {
         result = result.filter(p => p.category?.name === selectedCategory);
      }

      // Price
      if (priceRange === 'under-100') result = result.filter(p => p.price < 100);
      if (priceRange === '100-500') result = result.filter(p => p.price >= 100 && p.price <= 500);
      if (priceRange === 'over-500') result = result.filter(p => p.price > 500);

      // Sort
      if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);

      return result;
   }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

   const containerVariants = {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.1 } }
   };

   const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
   };

   return (
      <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
         <div className="container mx-auto px-6 md:px-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-100 pb-8">
               <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">The Collection</span>
                  <h1 className="text-4xl md:text-6xl text-black tracking-tight leading-none">
                     Archive <span className="font-serif italic text-gray-400">01</span>
                  </h1>
               </div>

               <div className="flex items-center gap-4 mt-8 md:mt-0">
                  <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                     <input
                        type="text"
                        placeholder="Search artifacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-transparent border-b border-gray-200 focus:border-black outline-none w-48 md:w-64 transition-all placeholder:text-gray-400 text-sm"
                     />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
               {/* Sidebar */}
               <div className="hidden md:block col-span-2 space-y-12 sticky top-32 self-start">
                  <div className="space-y-6">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Category</h3>
                     <ul className="space-y-3">
                        {categories.map(cat => (
                           <li key={cat}>
                              <button
                                 onClick={() => setSelectedCategory(cat)}
                                 className={`text-sm transition-colors text-left w-full hover:text-black ${selectedCategory === cat ? 'font-medium text-black' : 'text-gray-500'}`}
                              >
                                 {cat}
                              </button>
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Sort</h3>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" className="w-full justify-between font-normal text-gray-500 px-0 hover:bg-transparent hover:text-black">
                              <span className="text-sm">
                                 {sortBy === 'newest' ? 'Newest' : sortBy === 'price-asc' ? 'Low to High' : 'High to Low'}
                              </span>
                              <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 bg-white border-gray-100 shadow-xl">
                           <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest Arrivals</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => setSortBy('price-asc')}>Price: Low to High</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => setSortBy('price-desc')}>Price: High to Low</DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>

                  <Button
                     variant="link"
                     className="text-xs text-gray-400 hover:text-black px-0"
                     onClick={() => { setSelectedCategory('All'); setPriceRange('all'); setSearchQuery(''); setSortBy('newest'); }}
                  >
                     Reset Filters
                  </Button>
               </div>

               {/* Grid */}
               <div className="col-span-1 md:col-span-10">
                  <motion.div
                     variants={containerVariants}
                     initial="hidden"
                     animate="show"
                     className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16"
                  >
                     <AnimatePresence>
                        {filteredProducts.length > 0 ? (
                           filteredProducts.map((product) => (
                              <motion.div key={product._id} variants={itemVariants} layout>
                                 <ProductCard product={product} />
                              </motion.div>
                           ))
                        ) : (
                           <div className="col-span-full py-20 text-center">
                              <p className="text-gray-400">No artifacts found.</p>
                              <Button variant="link" onClick={() => setSelectedCategory('All')}>Clear filters</Button>
                           </div>
                        )}
                     </AnimatePresence>
                  </motion.div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ProductList;
