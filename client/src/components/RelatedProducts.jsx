import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import productService from '../api/services/productService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

const MOCK_PRODUCTS = [
  {
     _id: '1',
     name: 'Stoneware Vase No. 12',
     price: 180,
     category: { name: 'Ceramics' },
     images: ['/images/ceramic-vase.png'],
     description: 'Textured beige ceramic vase, hand-thrown.',
     createdAt: new Date().toISOString()
  },
  {
     _id: '2',
     name: 'Walnut Serving Bowl',
     price: 240,
     category: { name: 'Woodwork' },
     images: ['/images/wooden-bowl.png'],
     description: 'Hand-carved walnut bowl.',
     createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
     _id: '3',
     name: 'Natural Linen Throw',
     price: 120,
     category: { name: 'Textile' },
     images: ['/images/linen-textile.png'],
     description: 'Pure washed linen throw.',
     createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
     _id: '4',
     name: 'White Handbag',
     price: 45,
     category: { name: 'Textile' },
     images: ['/images/handbag.png'],
     description: 'Hand Bag for day to day use.',
     createdAt: new Date(Date.now() - 200000000).toISOString()
  }
];

const RelatedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate delay for 'vibe' if needed, or just fetch
        // setTimeout(async () => { ... }, 1000) ? 
        // User said "spinners ... keep user fetching like vibe" implies seeing it.
        // Real fetch is fast locally, so I'll add slight artificial delay to show off the spinners
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Vibe delay

        const data = await productService.getAll();
        
        let fetchedProducts = [];
        if (data && Array.isArray(data)) {
            fetchedProducts = data;
        } else if (data && data.products) {
            fetchedProducts = data.products;
        }

        if (fetchedProducts.length > 0) {
           setProducts(fetchedProducts);
        } else {
           setProducts(MOCK_PRODUCTS);
        }

      } catch (error) {
        console.error("Failed to fetch related products", error);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = direction === 'left' ? -320 : 320; // Approx card width + gap
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section className="py-24 border-t border-gray-100 mt-20 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between mb-12">
           <h3 className="text-xl font-serif italic text-black">You May Also Like</h3>
           <div className="flex gap-2">
               <button 
                 onClick={() => scroll('left')} 
                 className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:border-gray-400 transition-all active:scale-90 cursor-pointer"
               >
                 <ChevronLeft size={14} />
               </button>
               <button 
                 onClick={() => scroll('right')} 
                 className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:border-gray-400 transition-all active:scale-90 cursor-pointer"
               >
                 <ChevronRight size={14} />
               </button>
           </div>
        </div>
        
        <div className="relative group">
            {/* Scroll Container */}
            <div 
              ref={scrollRef} 
              className="flex gap-8 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {loading ? (
                 // Loading Skeletons
                 [...Array(4)].map((_, i) => (
                    <div key={i} className="min-w-[280px] md:min-w-[300px] aspect-[3/4] bg-gray-50 flex items-center justify-center snap-center animate-pulse">
                       <Spinner />
                    </div>
                 ))
              ) : (
                 products.map((product) => (
                   <div key={product._id} className="min-w-[280px] md:min-w-[300px] snap-center">
                     <ProductCard product={product} />
                   </div>
                 ))
              )}
            </div>
            
            {/* Fade Gradients for Scroll Indication */}
            <div className="absolute top-0 right-0 bottom-4 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
