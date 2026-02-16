import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';

// Hooks & Stores
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import productService from '../api/services/productService';
import { useCurrency } from '@/hooks/useCurrency';
import { detectUserCountry } from '@/lib/geolocation';
import { countries } from "@/lib/countries";

// Components
import ProductGallery from '../components/product-details/ProductGallery';
import ProductInfo from '../components/product-details/ProductInfo';
import ProductActions from '../components/product-details/ProductActions';
import ServiceBadges from '../components/product-details/ServiceBadges';
import MarqueeBanner from '../components/product-details/MarqueeBanner';
import TechnicalDetails from '../components/product-details/TechnicalDetails';
import ArtisanSection from '../components/product-details/ArtisanSection';
import RelatedProducts from '../components/RelatedProducts';

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { items: cartItems, openCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  // Product State
  // Strategy: Check navigation state first (fastest), then Cart, then Fetch
  const cachedProduct = location.state?.product || cartItems.find(item => item.product._id === id)?.product || null;
  const [product, setProduct] = useState(cachedProduct);
  const [loading, setLoading] = useState(!cachedProduct);

  // Currency State
  const [userCurrencyCode, setUserCurrencyCode] = useState('USD');
  const { formatPrice } = useCurrency(userCurrencyCode);

  // Detect User Location for Currency
  useEffect(() => {
    const detectLocation = async () => {
      const detected = await detectUserCountry(countries);
      if (detected) setUserCurrencyCode(detected.currency);
    };
    detectLocation();
  }, []);

  // Handle Navigation & Data Fetching
  useEffect(() => {
    const fetchProduct = async () => {
        try {
          setLoading(true);
          const res = await productService.getById(id);
          setProduct(res.data);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
    };

    // 1. Try to use cached product from navigation state or cart
    const reliableProduct = location.state?.product || cartItems.find(item => item.product._id === id)?.product;

    if (reliableProduct) {
        setProduct(reliableProduct);
        setLoading(false);
    } else {
        // 2. If no cache or ID mismatch, fetch from API
        if (!product || product._id !== id) {
             fetchProduct();
        }
    }
    
    // Reset View
    window.scrollTo(0, 0);
  }, [id, location.state]);

  // Update Page Title
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | HANDMADE`;
    }
  }, [product]);


  // Loading State
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Spinner />
    </div>
  );

  // Error/Empty State
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8">
         <ArrowRight size={40} />
      </div>
      <h2 className="text-4xl font-light tracking-tight uppercase mb-6">Archive Missing</h2>
      <Button asChild className="h-14 px-10 bg-black text-white hover:bg-gray-800 tracking-widest uppercase text-xs font-bold rounded-none">
        <Link to="/collection">Browse Collection <ArrowRight size={16} className="ml-2" /></Link>
      </Button>
    </div>
  );

  // Derived Data
  const artisan = product.artisan || {
     name: "Unknown Artisan",
     image: "/images/placeholder-artisan.jpg",
     location: product.location?.area || "Sri Lanka",
     bio: "A master craftsman dedicated to preserving traditional techniques."
  };
  
  const stock = (product.stock || product.countInStock) > 0 ? (product.stock || product.countInStock) : 50;

  return (
    <div className="bg-white min-h-screen font-sans text-[#111] selection:bg-black selection:text-white pb-32">
      
      {/* Container for Main Content */}
      <div className="container mx-auto px-6 md:px-12">
          
          {/* Navbar Spacing */}
          <div className="h-32"></div>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-[11px] font-medium uppercase text-gray-400 mb-12 tracking-normal">
            <Link to="/" className="hover:text-black hover:opacity-70 transition-all">Home</Link>
            <span className="text-gray-300">/</span>
            
            {location.state?.from === 'cart' ? (
                <button onClick={openCart} className="hover:text-black hover:opacity-70 transition-all uppercase">
                    Cart
                </button>
            ) : location.state?.from === 'checkout' ? (
                <Link to="/checkout" className="hover:text-black hover:opacity-70 transition-all">Checkout</Link>
            ) : (
                <Link to="/collection" className="hover:text-black hover:opacity-70 transition-all">Collection</Link>
            )}
            
            <span className="text-gray-300">/</span>
            <span className="text-black">{product.name}</span>
          </nav>

          {/* Main Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
             
             {/* Left: Gallery */}
             {/* Key ensures state reset on new product */}
             <ProductGallery key={`gallery-${product._id}`} product={product} />

             {/* Right: Details */}
             <div className="lg:col-span-6 flex flex-col h-full pt-4">
                <ProductInfo 
                    product={product} 
                    stock={stock} 
                    formatPrice={formatPrice} 
                />
                
                <ProductActions 
                    key={`actions-${product._id}`}
                    product={product} 
                    stock={stock} 
                    isAuthenticated={isAuthenticated} 
                    user={user} 
                />

                <ServiceBadges />
             </div>
          </div>
      </div>

      {/* Technical Details (Container Internal) */}
      <TechnicalDetails />

      {/* Artisan Section (Container Internal) */}
      <ArtisanSection artisan={artisan} />

      {/* Full Width Marquee */}
      <MarqueeBanner />

      {/* Related Products (Container Internal) */}
      <RelatedProducts />

    </div>
  );
};

export default ProductDetails;
