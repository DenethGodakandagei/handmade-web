import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Truck, Hammer, ChevronRight } from 'lucide-react';
import useCartStore from '../store/cartStore';
import orderService from '../api/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  cardNumber: z.string().min(16, 'Invalid card number').max(19),
  expiry: z.string().min(4, 'Invalid expiry'),
  cvc: z.string().min(3, 'Invalid CVC').max(4),
});

const Checkout = () => {
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 12.99;
  const total = subtotal + shipping;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Prepare order data matching OrderModel
      const orderData = {
        products: items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        shippingAddress: {
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country
        },
        paymentResult: {
          id: `PAY-${Date.now()}`,
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: data.email
        }
      };

      await orderService.create(orderData);
      
      clearCart();
      toast.success('Acquisition Successful', {
        description: 'Your heritage sequence has been initiated.',
      });
      navigate('/orders');
    } catch (error) {
      console.error(error);
      toast.error('Transaction Failed', {
        description: 'Secure handshake rejected. Please verify your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Secure Channel Idle</h2>
          <Button onClick={() => navigate('/products')} className="px-8 flex items-center space-x-2 rounded-full">
            <span>Return to Archives</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12">
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Secure Acquisition</h1>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <ShieldCheck size={14} className="text-primary" />
                <span>256-Bit Encrypted Handshake</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div className="space-y-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              {/* Identity */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px]">1</span>
                    <span>Identity Verification</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">First Name</Label>
                        <Input id="firstName" {...register('firstName')} className="bg-white border-gray-100 h-12 rounded-xl" placeholder="Ex. ARUNA" />
                        {errors.firstName && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Last Name</Label>
                        <Input id="lastName" {...register('lastName')} className="bg-white border-gray-100 h-12 rounded-xl" placeholder="Ex. PERERA" />
                        {errors.lastName && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Official Correspondence</Label>
                    <Input id="email" {...register('email')} className="bg-white border-gray-100 h-12 rounded-xl" placeholder="NAME@DOMAIN.COM" />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.email.message}</p>}
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px]">2</span>
                    <span>Logistics Node</span>
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Physical Coordinates</Label>
                        <Input id="address" {...register('address')} className="bg-white border-gray-100 h-12 rounded-xl" placeholder="STREET ADDRESS" />
                        {errors.address && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.address.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">City Sector</Label>
                            <Input id="city" {...register('city')} className="bg-white border-gray-100 h-12 rounded-xl" />
                            {errors.city && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postalCode" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Zone Code</Label>
                            <Input id="postalCode" {...register('postalCode')} className="bg-white border-gray-100 h-12 rounded-xl" />
                            {errors.postalCode && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.postalCode.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Nation State</Label>
                        <Input id="country" {...register('country')} className="bg-white border-gray-100 h-12 rounded-xl" />
                        {errors.country && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.country.message}</p>}
                    </div>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px]">3</span>
                    <span>Capital Transfer</span>
                </h3>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Card Sequence</Label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <Input id="cardNumber" {...register('cardNumber')} className="bg-gray-50 border-transparent pl-12 h-12 rounded-xl" placeholder="0000 0000 0000 0000" />
                        </div>
                        {errors.cardNumber && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.cardNumber.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiry" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Expiry</Label>
                            <Input id="expiry" {...register('expiry')} className="bg-gray-50 border-transparent h-12 rounded-xl" placeholder="MM/YY" />
                            {errors.expiry && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.expiry.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvc" className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Security Code</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                <Input id="cvc" {...register('cvc')} className="bg-gray-50 border-transparent pl-10 h-12 rounded-xl" placeholder="123" />
                            </div>
                            {errors.cvc && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.cvc.message}</p>}
                        </div>
                    </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full btn-premium h-20 text-xs shadow-2xl">
                {loading ? 'Processing Protocol...' : 'Confirm Acquisition'}
              </Button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-32 h-fit space-y-8">
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Manifest</h3>
                <div className="space-y-6 mb-8">
                    {items.map(item => (
                        <div key={item.product._id} className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden">
                                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase w-32 truncate">{item.product.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-bold text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-50 pt-6 space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400">
                        <span>Subtotal</span>
                        <span className="text-black">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400">
                        <span>Shipping Node</span>
                        <span className={shipping === 0 ? "text-green-600" : "text-black"}>
                          {shipping === 0 ? 'Secure Transport Included' : `$${shipping.toFixed(2)}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg font-black uppercase pt-4 border-t border-gray-100 mt-4">
                        <span>Total Due</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
             </div>

             <div className="flex items-center space-x-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                    <Hammer size={16} />
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    <strong className="text-primary uppercase tracking-widest block mb-1">Direct to Artisan</strong>
                    By completing this transaction, you are transferring funds directly to the master craftsman's verified wallet.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
