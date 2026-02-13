import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, MapPin, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import useCartStore from '@/store/cartStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();

  if (!product) return null;

  const handleAddToCart = (e) => {
     e.preventDefault();
     e.stopPropagation(); // Prevent navigation
     addToCart(product, 1);
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] bg-[#f8f8f8] overflow-hidden mb-4 rounded-sm">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400x500'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 contrast-[1.02]"
        />
        {product.isPreOrder && (
           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest font-medium text-black">
              Pre-order
           </div>
        )}
        
        {/* Add to Cart Pill */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
           <button 
             onClick={handleAddToCart}
             className="bg-white text-black px-6 py-3 rounded-full text-xs font-bold tracking-widest shadow-xl hover:bg-black hover:text-white transition-colors"
           >
              Add
           </button>
        </div>
      </div>
      
      <div className="flex flex-col space-y-1">
         <div className="flex justify-between items-start">
            <Link to={`/products/${product._id}`}>
               <h3 className="text-sm font-medium text-black group-hover:opacity-70 transition-opacity leading-tight pr-4">
                  {product.name}
               </h3>
            </Link>
            <span className="text-sm text-gray-500 font-light tabular-nums">${product.price}</span>
         </div>
         <p className="text-[10px] uppercase tracking-widest text-gray-400">
            {product.category?.name}
         </p>
      </div>
    </div>
  );
};

export default ProductCard;
