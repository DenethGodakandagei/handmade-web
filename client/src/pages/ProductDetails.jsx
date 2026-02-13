import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ShoppingBag, MapPin, Truck, Shield, 
  MessageCircle, ChevronRight, PlayCircle, Heart,
  Info, Leaf, Award, Globe
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import productService from '../api/services/productService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import useCartStore from '../store/cartStore';
import { toast } from 'sonner';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { isAuthenticated, user } = useAuthStore();
  
  // Cart Store
  const { addToCart, openCart } = useCartStore();

  const handleAddToCart = () => {
    if (product?.stock > 0) {
      addToCart(product, quantity);
      toast.success("Added to Collection", {
        description: `${quantity}x ${product.name} secured in your archive.`,
      });
      openCart();
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await productService.getById(id);
      setProduct(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
        <Skeleton className="aspect-square w-full rounded-[4rem] bg-white" />
        <div className="space-y-12">
           <Skeleton className="h-6 w-32 rounded-full bg-white" />
           <Skeleton className="h-24 w-full rounded-full bg-white" />
           <Skeleton className="h-32 w-full rounded-2xl bg-white" />
           <Skeleton className="h-20 w-full rounded-full bg-white" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8">
         <Info size={40} />
      </div>
      <h2 className="text-4xl font-bold tracking-tighter uppercase mb-6">Archive Missing</h2>
      <Button asChild className="btn-artisan h-14 px-10">
        <Link to="/products">Return to Lineage</Link>
      </Button>
    </div>
  );

  return (
    <div className="bg-[#FAF9F6] pt-10 pb-32">
      <div className="container mx-auto px-6">
        {/* Navigation / Breadcrumbs */}
        <nav className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-16">
          <Link to="/" className="hover:text-primary transition-colors">Origins</Link>
          <ChevronRight size={12} className="text-gray-200" />
          <Link to="/products" className="hover:text-primary transition-colors">Archives</Link>
          <ChevronRight size={12} className="text-gray-200" />
          <span className="text-black font-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Image Gallery - Emotional & Large */}
          <div className="space-y-8 sticky top-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-white rounded-[4rem] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white relative group"
            >
              <AnimatePresence mode="wait">
                 <motion.img 
                   key={activeImage}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.5 }}
                   src={product.images?.[activeImage]} 
                   alt={product.name} 
                   className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                 />
              </AnimatePresence>
              
              {product.video && (
                <button className="absolute bottom-10 right-10 bg-white text-black p-6 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center">
                  <PlayCircle size={24} />
                </button>
              )}
            </motion.div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-4">
              {product.images?.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-24 h-24 flex-shrink-0 rounded-3xl overflow-hidden transition-all duration-500 relative ${activeImage === i ? 'ring-4 ring-primary ring-offset-4 ring-offset-[#FAF9F6] scale-110 shadow-xl' : 'opacity-40 hover:opacity-100 grayscale'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Content - Luxury Layout */}
          <div className="flex flex-col">
            <div className="mb-12 space-y-8">
              <div className="flex items-center justify-between">
                 <Badge className="rounded-full bg-primary/10 text-primary border-none font-bold text-[10px] px-5 py-2 uppercase tracking-widest">
                   {product.category?.name}
                 </Badge>
                 <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-50">
                    <Star size={16} fill="#A45C40" className="text-primary" />
                    <span className="text-xs font-bold">{product.averageRating?.toFixed(1) || '4.9'}</span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest pl-2 border-l border-gray-100 italic">verified</span>
                 </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] text-balance">{product.name}</h1>
              
              <div className="flex flex-wrap gap-6 items-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-50">
                   <MapPin size={14} className="mr-2 text-primary" />
                   <span>Source: {product.location?.area}, {product.location?.district}</span>
                </div>
                <div className="flex items-center text-primary italic">
                   <Award size={14} className="mr-2" />
                   <span>Master Class Artifact</span>
                </div>
              </div>
              
              <p className="text-6xl font-bold tracking-tighter text-black flex items-start">
                 <span className="text-2xl mt-2 mr-1">$</span>
                 {product.price}
              </p>
            </div>

            <p className="text-gray-500 font-light leading-relaxed mb-16 text-xl text-balance">
              {product.description || "A masterfully crafted artifact that embodies the centuries-old heritage of the central highlands. Using only locally sourced organic materials, each element is formed by hand over forty-eight hours."}
            </p>

            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
                   <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Allocation status</p>
                   {product.stock > 0 ? (
                      <div className="space-y-2">
                         <div className="flex items-center text-sm font-bold uppercase text-black">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-3 shadow-lg shadow-green-200"></div>
                            Ready for Dispatch
                         </div>
                         <p className="text-[10px] text-gray-400 pl-5.5 font-medium">{product.stock} Artifacts in Archive</p>
                      </div>
                   ) : (
                      <div className="flex items-center text-sm font-bold uppercase text-amber-600">
                         <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-3 animate-pulse"></div>
                         Limited Pre-Order
                      </div>
                   )}
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Quantity</p>
                      <span className="text-xs font-bold text-gray-400">Collector Limit: 5</span>
                   </div>
                   <div className="flex items-center bg-gray-50 rounded-2xl p-1">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center font-bold hover:bg-white rounded-xl transition-all shadow-none hover:shadow-lg hover:shadow-black/5"
                      >—</button>
                      <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center font-bold hover:bg-white rounded-xl transition-all shadow-none hover:shadow-lg hover:shadow-black/5"
                      >+</button>
                   </div>
                </div>
              </div>


              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-grow btn-artisan h-20 text-xs font-bold uppercase tracking-[0.3em] shadow-3xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={20} className="mr-3" />
                  {product.stock > 0 ? 'Acquire for Collection' : 'Request Heritage Sequence'}
                </Button>
                <Button variant="outline" className="h-20 w-20 rounded-full border-gray-100 hover:border-red-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all p-0">
                  <Heart size={24} />
                </Button>
              </div>

              {isAuthenticated && user?.role === 'buyer' && (
                <div className="pt-4">
                   <Link to={`/customizations/new/${product._id}`} className="flex items-center justify-center w-full py-6 rounded-2xl border-2 border-dashed border-gray-200 text-[10px] font-black tracking-widest uppercase text-gray-400 hover:border-primary hover:text-primary transition-all group">
                    <MessageCircle size={16} className="mr-3 group-hover:rotate-12 transition-transform" />
                    Bespoke Amendment Request
                   </Link>
                </div>
              )}
            </div>

            {/* Premium Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-16 pt-16 border-t border-gray-100">
               <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                     <Truck size={20} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest mb-1">Global Logic</h5>
                    <p className="text-[11px] text-gray-400 font-light leading-relaxed">Direct-from-source authenticated logistics across 45 nations.</p>
                  </div>
               </div>
               <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                     <Shield size={20} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest mb-1">Purity Protocol</h5>
                    <p className="text-[11px] text-gray-400 font-light leading-relaxed">Independently verified for 100% organic material origins.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Artisan Master Section - Warm & Emotional */}
        <section className="mt-40 bg-white rounded-[4rem] p-12 lg:p-24 shadow-2xl shadow-primary/5 border border-gray-50 flex flex-col md:flex-row gap-20 items-center overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
           
           <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <Avatar className="w-48 h-48 border-[12px] border-[#FAF9F6] shadow-2xl scale-110">
                <AvatarImage src={product.artisan?.image} />
                <AvatarFallback className="bg-primary text-white text-5xl font-bold uppercase">
                   {product.artisan?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border-4 border-white">
                MASTER CRAFTSMAN
              </div>
           </div>

           <div className="flex-grow space-y-8">
              <div className="space-y-2">
                 <h3 className="text-4xl font-bold tracking-tighter uppercase">{product.artisan?.name || "Aruna Perera"}</h3>
                 <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] flex items-center">
                    <Leaf size={12} className="mr-2" />
                    Heriditary workshop • 4th Generation
                 </p>
              </div>
              
              <blockquote className="text-2xl font-light italic text-gray-500 leading-relaxed max-w-2xl text-balance">
                 "Every form I create is a conversation with my grandfathers. We don't just shape material; we breathe life into the stillness of heritage."
              </blockquote>
              
              <div className="flex flex-wrap gap-4 pt-4">
                 <Button variant="outline" className="rounded-full px-10 h-14 font-bold uppercase tracking-widest text-[10px] border-2 border-primary hover:bg-primary hover:text-white transition-all">
                    Access Workshop Archives
                 </Button>
                 <Button variant="ghost" className="rounded-full px-8 h-14 font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2">
                    <Globe size={16} />
                    <span>Regional Lineage Map</span>
                 </Button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
