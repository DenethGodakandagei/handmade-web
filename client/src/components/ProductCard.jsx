import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, MapPin, Heart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card';

import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
   const { addToCart } = useCartStore();
   const { user } = useAuthStore();

   const [isAdding, setIsAdding] = useState(false);

   if (!product) return null;

   const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent navigation

      setIsAdding(true);
      addToCart(product, 1);

      toast.success("Added to Collection", {
         description: `1x ${product.name} secured in your archive.`,
      });

      setIsAdding(false);
   };

   return (
      <div className="group/card cursor-pointer">
         <Link to={`/collection/${product._id}`} state={{ product }}>
            <div className="relative aspect-[3/4] bg-[#f8f8f8] overflow-hidden mb-4 rounded-sm">
               <img
                  src={product.images?.[0] || 'https://via.placeholder.com/400x500'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 contrast-[1.02]"
               />
               {product.isPreOrder && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest font-medium text-black">
                     Pre-order
                  </div>
               )}

               {/* Add to Cart Pill */}
               <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 ease-out">
                  <button
                     onClick={handleAddToCart}
                     disabled={isAdding}
                     className="bg-white text-black px-6 py-3 text-xs font-bold tracking-widest hover:bg-black hover:text-white transition-colors uppercase flex items-center justify-center gap-2 min-w-[100px] rounded-none relative cursor-pointer"
                  >
                     <span className={isAdding ? 'opacity-0' : 'opacity-100'}>Acquire</span>
                     {isAdding && (
                        <div className="absolute inset-0 flex items-center justify-center scale-75">
                           <Spinner />
                        </div>
                     )}
                  </button>
               </div>
            </div>
         </Link>

         <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-start">
               <Link to={`/collection/${product._id}`} state={{ product }}>
                  <h3 className="text-sm font-medium text-black group-hover/card:opacity-70 transition-opacity leading-tight pr-4">
                     {product.name}
                  </h3>
               </Link>
               <span className="text-sm text-gray-500 font-light tabular-nums">${product.price}</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
               {product.category?.name}
            </p>
            <div className="flex items-center justify-between pt-1">
               <div className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] text-gray-500 font-medium">
                     {product.averageRating ? product.averageRating.toFixed(1) : 'New'}
                  </span>
               </div>
               <Link to={`/collection/${product._id}`} state={{ product }} className="text-[10px] uppercase font-bold tracking-widest text-black hover:text-gray-500 transition-colors">
                  {user?.role === 'artisan' || user?.role === 'admin' ? 'View Review' : 'Add Review'}
               </Link>
            </div>
         </div>
      </div>
   );
};

export default ProductCard;
