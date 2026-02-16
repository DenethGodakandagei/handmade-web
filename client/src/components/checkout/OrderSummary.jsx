import React from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { ShieldCheck, Truck, Award, Gift, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrderSummary = ({ items, subtotal, shippingCost, wrappingCost, tax, discount, total, userCurrencyCode, handleApplyCoupon, couponCode, setCouponCode, isGiftWrapping }) => {
  const { formatPrice } = useCurrency(userCurrencyCode);
  
  return (
    <div className="bg-white border border-gray-100 p-8 md:p-10 space-y-10">
      
      <div>
         <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-black mb-10">Manifest</h3>
         <div className="space-y-8">
             {items.map(item => (
                  <div key={item.product._id} className="flex justify-between items-start group">
                      <Link to={`/products/${item.product._id}`} className="flex gap-6 hover:opacity-70 transition-opacity">
                          <div className="w-16 h-20 bg-gray-200 overflow-hidden relative flex-shrink-0">
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-out" />
                          </div>
                          <div className="py-1">
                              <h4 className="font-medium text-sm text-black leading-tight mb-2 tracking-tight">{item.product.name}</h4>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium flex items-center gap-2">
                                  Qty {item.quantity}
                              </p>
                          </div>
                      </Link>
                     <div className="text-sm font-medium py-1 text-right">
                         <div>${(item.product.price * item.quantity).toFixed(2)}</div>
                         {userCurrencyCode !== 'USD' && (
                             <div className="text-[10px] text-gray-400 font-normal">
                                 ≈ {formatPrice(item.product.price * item.quantity)}
                             </div>
                         )}
                     </div>
                  </div>
             ))}
         </div>

         {/* Consolidated Gift Service Indicator */}
         {isGiftWrapping && (
             <div className="mt-8 p-4 bg-green-50/50 border border-green-100/50 rounded-sm flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-700">
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                         <Gift size={14} />
                     </div>
                     <div>
                         <span className="block text-[10px] font-bold uppercase tracking-widest text-green-700">Premium Gift Service</span>
                         <span className="block text-[9px] uppercase tracking-wider text-green-600/70 mt-0.5 font-medium">Signature wrapping & card included</span>
                     </div>
                 </div>
                 <Check size={12} className="text-green-500" />
             </div>
         )}
      </div>

      <div className="pt-10 border-t border-gray-200 space-y-4">
          <div className="flex gap-0 border-b border-gray-200 pb-1">
             <input 
                 type="text" 
                 value={couponCode}
                 onChange={(e) => setCouponCode(e.target.value)}
                 placeholder="DISCOUNT CODE" 
                 className="bg-transparent py-3 text-xs w-full focus:outline-none uppercase placeholder:text-gray-400 font-medium tracking-wide"
             />
             <button type="button" onClick={handleApplyCoupon} className="text-[10px] uppercase tracking-widest font-bold hover:text-gray-500 transition-colors whitespace-nowrap px-4">Apply</button>
          </div>
      </div>

      <div className="space-y-4 pt-4 text-xs tracking-wide uppercase font-medium text-gray-500">
         <div className="flex justify-between items-center">
             <span>Subtotal</span>
             <div className="text-right">
                 <span className="text-black block">${subtotal.toFixed(2)}</span>
                 {userCurrencyCode !== 'USD' && <span className="text-[10px] text-gray-400 font-normal block">≈ {formatPrice(subtotal)}</span>}
             </div>
         </div>
         <div className="flex justify-between items-center">
             <span>{shippingCost > 5 ? 'Express Dispatch' : 'Standard Shipping'}</span>
             <div className="text-right">
                 <span className="text-black block">${shippingCost.toFixed(2)}</span>
                 {userCurrencyCode !== 'USD' && <span className="text-[10px] text-gray-400 font-normal block">≈ {formatPrice(shippingCost)}</span>}
             </div>
         </div>
         {wrappingCost > 0 && (
              <div className="flex justify-between items-center">
                 <span>Gift Wrapping</span>
                 <div className="text-right">
                     <span className="text-black block">${wrappingCost.toFixed(2)}</span>
                     {userCurrencyCode !== 'USD' && <span className="text-[10px] text-gray-400 font-normal block">≈ {formatPrice(wrappingCost)}</span>}
                 </div>
             </div>
         )}
          <div className="flex justify-between items-center">
             <span>Tax</span>
             <div className="text-right">
                 <span className="text-black block">${tax.toFixed(2)}</span>
                 {userCurrencyCode !== 'USD' && <span className="text-[10px] text-gray-400 font-normal block">≈ {formatPrice(tax)}</span>}
             </div>
         </div>
         {discount > 0 && (
             <div className="flex justify-between items-center text-black">
                 <span>Discount</span>
                 <div className="text-right">
                     <span className="block">-${discount.toFixed(2)}</span>
                      {userCurrencyCode !== 'USD' && <span className="text-[10px] text-gray-400 font-normal block">≈ -{formatPrice(discount)}</span>}
                 </div>
             </div>
         )}
         <div className="flex justify-between text-xl font-medium pt-6 border-t border-gray-200 mt-2 text-black normal-case">
             <span>Total</span>
             <div className="text-right">
                 <span>${total.toFixed(2)}</span>
                 {userCurrencyCode !== 'USD' && (
                     <p className="text-xs text-gray-400 font-normal mt-1">
                         ≈ {formatPrice(total)}
                     </p>
                 )}
             </div>
         </div>
      </div>

      {/* Trust Manifest */}
      <div className="pt-8 border-t border-gray-50 flex flex-col gap-6">
          <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <ShieldCheck size={16} strokeWidth={1.5} />
              </div>
              <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-black">Secure Checkout</span>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-400 mt-0.5 font-medium">256-Bit SSL Encryption</span>
              </div>
          </div>
          
          <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <Truck size={16} strokeWidth={1.5} />
              </div>
              <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-black">Protected Dispatch</span>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-400 mt-0.5 font-medium">Full transit insurance included</span>
              </div>
          </div>

          <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <Award size={16} strokeWidth={1.5} />
              </div>
              <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-black">Authentic Origin</span>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-400 mt-0.5 font-medium">Verified Artisan Craftsmanship</span>
              </div>
          </div>
      </div>
    </div>
  );
};
