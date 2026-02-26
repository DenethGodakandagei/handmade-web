import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import productService from '../api/services/productService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

const RelatedProducts = ({ productId, categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);

        // Build query params – fetch products from the same category
        const params = { limit: 12 };
        if (categoryId) {
          params.category = categoryId;
        }

        const data = await productService.getAll(params);

        let fetchedProducts = [];
        if (data && data.products) {
          fetchedProducts = data.products;
        } else if (data && Array.isArray(data)) {
          fetchedProducts = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          fetchedProducts = data.data;
        }

        // Remove the current product from the list
        if (productId) {
          fetchedProducts = fetchedProducts.filter(
            (p) => p._id !== productId
          );
        }

        // If no same-category products found, fetch a general set instead
        if (fetchedProducts.length === 0) {
          const fallback = await productService.getAll({ limit: 12 });
          let fallbackProducts = [];
          if (fallback && fallback.products) {
            fallbackProducts = fallback.products;
          } else if (fallback && Array.isArray(fallback)) {
            fallbackProducts = fallback;
          } else if (fallback && fallback.data && Array.isArray(fallback.data)) {
            fallbackProducts = fallback.data;
          }
          fetchedProducts = fallbackProducts.filter(
            (p) => p._id !== productId
          );
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to fetch related products', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [productId, categoryId]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -240 : 240;
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
                <div key={i} className="min-w-[200px] md:min-w-[220px] aspect-[3/4] bg-gray-50 flex items-center justify-center snap-center animate-pulse">
                  <Spinner />
                </div>
              ))
            ) : (
              products.map((product) => (
                <div key={product._id} className="min-w-[200px] md:min-w-[220px] snap-center">
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
