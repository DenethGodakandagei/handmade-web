import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { toast } from 'sonner';

const ProductActions = ({
  product, stock, isAuthenticated, user
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (stock > 0) {
      setIsAdding(true);

      const productToAdd = { ...product, countInStock: stock, stock: stock };
      addToCart(productToAdd, quantity);

      toast.success("Added to Collection", {
        description: `${quantity}x ${product.name} secured in your archive.`,
      });

      setIsAdding(false);
    }
  };
  const [isLiked, setIsLiked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const handleLike = () => {
    if (!isLiked) {
      // Like Action
      setIsLiked(true);
      setConfettiKey(prev => prev + 1); // Force new animation instance
      setShowConfetti(true);

      // Timer to hide
      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      // Unlike Action
      setIsLiked(false);
      setShowConfetti(false);
    }
  };

  return (
    <div className="space-y-6 pt-4">

      <div className="flex flex-col gap-4">

        {/* Quantity Selector - Pill Shape (Rounded Full) - Smaller Size */}
        <div className="flex items-center border border-gray-200 w-full md:w-32 h-10 rounded-full overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 text-black border-r border-gray-200 cursor-pointer"
          >
            <Minus size={10} strokeWidth={1.5} />
          </button>
          <span className="flex-1 text-center font-mono text-xs">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            disabled={quantity >= stock}
            className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 text-black border-l border-gray-200 cursor-pointer"
          >
            <Plus size={10} strokeWidth={1.5} />
          </button>
        </div>

        {/* Add to Cart Button - Checkout Style (remains boxy/sharp as per previous) */}
        <div className="flex gap-4">
          <Button
            onClick={handleAddToCart}
            disabled={stock <= 0 || isAdding}
            className="flex-grow h-14 bg-black text-white hover:bg-gray-800 text-xs font-bold uppercase tracking-[0.25em] rounded-none shadow-none disabled:opacity-50 transition-all flex justify-center items-center relative cursor-pointer"
          >
            <span className={isAdding ? 'opacity-0' : 'opacity-100'}>{stock > 0 ? 'Acquire' : 'Sold Out'}</span>
            {isAdding && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </Button>
          <button
            onClick={handleLike}
            className={`h-14 w-14 border flex items-center justify-center transition-all cursor-pointer relative group ${isLiked ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-400'}`}
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            >
              <Heart size={18} strokeWidth={isLiked ? 0 : 1} className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-black'}`} />
            </motion.div>

            {/* Heart Confetti Bloom */}
            <AnimatePresence>
              {showConfetti && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`${confettiKey}-${i}`}
                      initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                      animate={{
                        opacity: 0,
                        scale: 1.5,
                        x: (Math.random() - 0.5) * 80, // Wider spread
                        y: (Math.random() - 1) * 80 - 30 // Higher float
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute z-20 pointer-events-none"
                    >
                      <Heart size={10} className="fill-red-500 text-red-500" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Customization Link */}

      <Link to={`/customizations/new/${product._id}`} className="block text-center py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-black transition-colors border-b border-transparent hover:border-black w-max mx-auto">
        Request Customization
      </Link>

    </div>
  );
};

export default ProductActions;
