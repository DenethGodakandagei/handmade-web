import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import orderService from '../api/services/orderService';
import { toast } from 'sonner';
import { countries } from "@/lib/countries"
import { detectUserCountry } from '@/lib/geolocation';
import { useCurrency } from '@/hooks/useCurrency';

// Ui Components
import { InputField } from '@/components/ui/InputField';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Check } from 'lucide-react'; // Added Check icon

// Checkout Components
import { Logistics } from '@/components/checkout/Logistics';
import { GiftOptions } from '@/components/checkout/GiftOptions';
import { PaymentInfo } from '@/components/checkout/PaymentInfo';
import { OrderSummary } from '@/components/checkout/OrderSummary';

// Enhanced Schema
const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required').optional().or(z.literal('')),
  city: z.string().min(2, 'City is required').optional().or(z.literal('')),
  postalCode: z.string().min(3, 'Postal code is required').optional().or(z.literal('')),
  country: z.string().min(2, 'Country is required').optional().or(z.literal('')),
  // New Fields
  isGift: z.boolean().optional(),
  giftNote: z.string().optional(),
  useWrapping: z.boolean().optional(),
});

const Checkout = () => {
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [addressMode, setAddressMode] = useState('new'); 
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const hasRedirected = React.useRef(false);

  // Set Page Title
  React.useEffect(() => {
    document.title = "Secure Checkout | Artisan";
    return () => { document.title = "Artisan."; }; // Reset on unmount
  }, []);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0 && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error('Cart is empty', { description: 'Please add items to your cart first.', id: 'empty-cart-toast' });
      navigate('/products');
    }
  }, [items, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
       address: '', city: '', postalCode: '', country: '', phone: '',
       isGift: false, useWrapping: false
    }
  });

  // Derived calculations
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = shippingMethod === 'express' ? 15 : 5;
  const wrappingCost = watch('useWrapping') ? 5 : 0;
  const tax = 3; 
  const total = subtotal + shippingCost + wrappingCost + tax - discount;
  
  const selectedCountry = watch('country');
  
  // State for mobile details
  const [countryCode, setCountryCode] = useState('+1');
  const [userCurrencyCode, setUserCurrencyCode] = useState('USD');
  const { formatPrice } = useCurrency(userCurrencyCode);
  
  // Section Completion Logic
  const isIdentityComplete = 
    watch('firstName')?.length >= 2 && 
    watch('lastName')?.length >= 2 && 
    watch('email')?.includes('@') && 
    watch('phone')?.length >= 5 &&
    !errors.firstName && !errors.lastName && !errors.email && !errors.phone;

  // Auto-detect country from IP
  React.useEffect(() => {
    // Keep heavy logic out of component
    detectUserCountry(countries).then((detected) => {
        if (detected) {
            // Only update if user hasn't already made a selection (naive check, but effective for init)
            if (!selectedCountry) {
                setValue('country', detected.name);
            }
            if (countryCode === '+1' && detected.dial_code) {
                setCountryCode(detected.dial_code);
            }
            if (detected.currency) {
                setUserCurrencyCode(detected.currency);
            }
        }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleCountrySelect = (val) => {
     setValue('country', val, { shouldValidate: true });
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SAVE5') {
       setDiscount(5);
       toast.success('Code Accepted', { description: 'Discount applied.' });
    } else {
       toast.error('Invalid Code', { description: 'Please check and try again.' });
       setDiscount(0);
    }
  };

  const onSubmit = async (data) => {
    let finalAddress = {};
    const fullPhone = `${countryCode} ${data.phone}`;

    if (!data.address || !data.city) {
        toast.error('Incomplete Details', { description: 'Delivery coordinates required.' });
        return;
    }
    finalAddress = {
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country
    };

    setLoading(true);
    try {
      const orderData = {
        products: items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        shippingAddress: finalAddress,
        isGift: data.isGift,
        giftNote: data.giftNote,
        giftWrapping: data.useWrapping,
        paymentResult: {
          id: `PAY-${Date.now()}`,
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: data.email,
          phone: fullPhone
        }
      };

      await orderService.create(orderData);
      clearCart();
      toast.success('Acquisition Complete');
      navigate('/order-success');
    } catch (error) {
      console.error(error);
      toast.error('Transaction Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-32 font-sans text-[#111] selection:bg-black selection:text-white">
      
      {/* Header */}
      <header className="container mx-auto px-6 md:px-12 mb-16">
        <div className="flex flex-col md:flex-row justify-between items-end pb-8 border-b border-gray-100">
            <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">The Acquisition</span>
                <h1 className="text-4xl md:text-6xl text-black tracking-tight leading-none">
                    Checkout <span className="font-serif italic text-gray-300 ml-2">Review</span>
                </h1>
            </div>
        </div>
      </header>

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-20">
        
        {/* LEFT: Forms */}
        <div className="lg:col-span-7 py-8 space-y-24">
           
           <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Section 01: Identity */}
            <div className="space-y-12">
                <div className="flex items-baseline gap-4 border-b border-gray-100 pb-4">
                    {isIdentityComplete ? (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <Check className="text-white w-3 h-3" strokeWidth={4} />
                        </div>
                    ) : (
                        <span className="text-xl font-light text-gray-300">01</span>
                    )}
                    <h2 className="text-xl font-medium tracking-tight uppercase">Identity</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pl-0 md:pl-8">
                    <InputField label="First Name" register={register} name="firstName" error={errors.firstName} placeholder="Given Name" />
                    <InputField label="Last Name" register={register} name="lastName" error={errors.lastName} placeholder="Family Name" />
                    <InputField label="Email Address" register={register} name="email" error={errors.email} placeholder="email@domain.com" />
                    
                    {/* Mobile Input with Country Code */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.15em] font-medium text-gray-400">Mobile</label>
                        <div className="flex gap-4">
                            <div className="w-1/3 min-w-[120px]">
                                <SearchableSelect 
                                    label=""
                                    value={countryCode} // Using dial_code as value
                                    onChange={(val) => setCountryCode(val)} // Update country code state
                                    options={countries.map(c => ({ value: c.dial_code, label: `${c.code} ${c.dial_code}`, name: c.name, dial_code: c.dial_code, code: c.code }))}
                                    placeholder="+1"
                                    renderTrigger={(selected) => <span className="text-lg font-light">{selected ? `${selected.code} ${selected.dial_code}` : "+1"}</span>}
                                    renderItem={(item) => (
                                        <div className="flex justify-between w-full">
                                            <span>{item.name}</span>
                                            <span className="text-gray-400 font-mono">{item.dial_code}</span>
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                type="tel"
                                {...register('phone')}
                                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                                inputMode="numeric"
                                placeholder="000 000 0000"
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-light focus:outline-none focus:border-black transition-colors placeholder:text-gray-200"
                                />
                            </div>
                        </div>
                        {errors.phone && <span className="text-xs text-red-500 font-medium tracking-wide">{errors.phone.message}</span>}
                    </div>
                </div>
            </div>

            {/* Section 02: Logistics (Imported Component) */}
            <Logistics 
                register={register} 
                errors={errors} 
                watch={watch} 
                setValue={setValue} 
                shippingMethod={shippingMethod} 
                setShippingMethod={setShippingMethod} 
            />

            {/* Gift Options (New Feature) */}
            <GiftOptions register={register} watch={watch} setValue={setValue} />

            {/* Section 03: Payment (Imported Component) */}
            <PaymentInfo />

            {/* Mobile Manifest - Visible below lg (desktop) breakpoint */}
            <div className="lg:hidden mt-12 mb-8 border-t border-gray-100 pt-8">
                <OrderSummary 
                    items={items}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    wrappingCost={wrappingCost}
                    tax={tax}
                    discount={discount}
                    total={total}
                    userCurrencyCode={userCurrencyCode}
                    handleApplyCoupon={handleApplyCoupon}
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    isGiftWrapping={watch('useWrapping')}
                />
            </div>

            <div className="mt-8 pl-0 md:pl-8">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-black text-white h-16 text-xs uppercase tracking-[0.25em] font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Confirm Acquisition'
                    )}
                </button>
                <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed max-w-md mx-auto">
                    By confirming, you agree to our Terms of Service. <br/>
                    All artifacts are verified authentic.
                </p>
            </div>

           </form>
        </div>

        {/* RIGHT: Summary - Desktop Only */}
        <div className="lg:col-span-5 h-fit lg:sticky lg:top-32 hidden lg:block">
           <OrderSummary 
                items={items}
                subtotal={subtotal}
                shippingCost={shippingCost}
                wrappingCost={wrappingCost}
                tax={tax}
                discount={discount}
                total={total}
                userCurrencyCode={userCurrencyCode}
                handleApplyCoupon={handleApplyCoupon}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                isGiftWrapping={watch('useWrapping')}
            />
        </div>

      </div>
    </div>
  );
};

export default Checkout;
