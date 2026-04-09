import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../api/services/orderService';
import paymentService from '../api/services/paymentService';
import { toast } from 'sonner';
import { countries } from "@/lib/countries";
import { detectUserCountry } from '@/lib/geolocation';
import { useCurrency } from '@/hooks/useCurrency';

// Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// Ui Components
import { InputField } from '@/components/ui/InputField';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Check } from 'lucide-react';

// Checkout Components
import { Logistics } from '@/components/checkout/Logistics';
import { GiftOptions } from '@/components/checkout/GiftOptions';
import { PaymentInfo } from '@/components/checkout/PaymentInfo';
import { OrderSummary } from '@/components/checkout/OrderSummary';

// ─── Initialise Stripe (singleton, outside of component) ────────────────────
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51QeUmGQP2cLYp48gx46lx8zTLraBQX3wK95fVk3GUUmRESmaki00yUXf9dXVmoRemMVyuifjMzFRtYMo5HAcbCgs00KqTunN9s'
);

// ─── Schema ─────────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required').optional().or(z.literal('')),
  city: z.string().min(2, 'City is required').optional().or(z.literal('')),
  postalCode: z.string().min(3, 'Postal code is required').optional().or(z.literal('')),
  country: z.string().min(2, 'Country is required').optional().or(z.literal('')),
  isGift: z.boolean().optional(),
  giftNote: z.string().optional(),
  useWrapping: z.boolean().optional(),
});

// ─── Inner form (needs Stripe hooks, must be inside <Elements>) ─────────────
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [addressMode, setAddressMode] = useState('new');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [cardError, setCardError] = useState(null);
  const hasRedirected = React.useRef(false);
  const paymentSucceeded = React.useRef(false); // prevents empty-cart redirect after payment

  // Set Page Title
  React.useEffect(() => {
    document.title = "Secure Checkout | Artisan";
    return () => { document.title = "Artisan."; };
  }, []);

  // Redirect if cart is empty — but NOT if we just completed a payment
  React.useEffect(() => {
    if (items.length === 0 && !hasRedirected.current && !paymentSucceeded.current) {
      hasRedirected.current = true;
      toast.error('Cart is empty', { description: 'Please add items to your cart first.', id: 'empty-cart-toast' });
      navigate('/collection');
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
    detectUserCountry(countries).then((detected) => {
      if (detected) {
        if (!selectedCountry) setValue('country', detected.name);
        if (countryCode === '+1' && detected.dial_code) setCountryCode(detected.dial_code);
        if (detected.currency) setUserCurrencyCode(detected.currency);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
  };

  // ── Main submit ────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (!stripe || !elements) {
      toast.error('Stripe is not loaded yet. Please wait a moment.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card field not found.');
      return;
    }

    if (!data.address || !data.city) {
      toast.error('Incomplete Details', { description: 'Delivery address required.' });
      return;
    }

    const fullPhone = `${countryCode} ${data.phone}`;
    const finalAddress = {
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country
    };

    setLoading(true);

    try {
      // 1️⃣ Create a PaymentIntent on the server
      // Note: axios interceptor already returns response.data directly
      const intentData = await paymentService.createPaymentIntent(total, 'usd');
      const { clientSecret } = intentData;

      // 2️⃣ Confirm the card payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: fullPhone,
            address: {
              line1: data.address,
              city: data.city,
              postal_code: data.postalCode,
              country: data.country?.substring(0, 2).toUpperCase() || 'US',
            },
          },
        },
      });

      if (stripeError) {
        toast.error('Payment Failed', { description: stripeError.message });
        setLoading(false);
        return;
      }

      // 3️⃣ Payment successful — create the order in our database
      const orderData = {
        orderItems: items.map(item => {
          const payload = {
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          };
          if (item.product.customizationRequestId) {
            payload.customizationRequest = item.product.customizationRequestId;
          }
          return payload;
        }),
        totalAmount: total,
        shippingAddress: finalAddress,
        paymentMethod: 'Stripe',
        isGift: data.isGift,
        giftNote: data.giftNote,
        giftWrapping: data.useWrapping,
        paymentResult: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: data.email,
          phone: fullPhone,
        }
      };

      await orderService.create(orderData);
      // Set flag BEFORE clearing cart to prevent the empty-cart useEffect
      // from redirecting to /collection and racing against navigate('/order-success')
      paymentSucceeded.current = true;
      clearCart();
      toast.success('Payment Successful! 🎉', { description: 'Your order has been placed.' });
      navigate('/order-success');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Transaction Failed', { description: error?.response?.data?.message || 'Please try again.' });
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
                        value={countryCode}
                        onChange={(val) => setCountryCode(val)}
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

            {/* Section 02: Logistics */}
            <Logistics
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              shippingMethod={shippingMethod}
              setShippingMethod={setShippingMethod}
            />

            {/* Gift Options */}
            <GiftOptions register={register} watch={watch} setValue={setValue} />

            {/* Section 03: Payment — real Stripe card element */}
            <PaymentInfo
              cardError={cardError}
              onCardChange={handleCardChange}
            />

            {/* Mobile Order Summary */}
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

            {/* Submit */}
            <div className="mt-8 pl-0 md:pl-8">
              <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full bg-black text-white h-16 text-xs uppercase tracking-[0.25em] font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirm & Pay'
                )}
              </button>
              <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed max-w-md mx-auto">
                By confirming, you agree to our Terms of Service.<br />
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

// ─── Wrapper that provides the Stripe context ────────────────────────────────
const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
