import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const CartSidebar = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    removeFromCart,
    updateQuantity
  } = useCartStore();

  const validItems = Array.isArray(items) ? items.filter(item => item && item.product) : [];
  const subtotal = validItems.reduce((sum, item) => sum + (item.product.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 100 ? 0 : 12.99;
  const total = subtotal + shipping;

  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white border-none shadow-2xl p-0">
        <SheetHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-gray-100">
          <SheetTitle className="font-serif text-3xl font-normal text-black">Cart ({validItems.length})</SheetTitle>
          <SheetDescription className="hidden">
            Review your selected items and proceed to checkout.
          </SheetDescription>
          {/* Close button is handled by Sheet primitive usually, but we can have custom if needed. 
              Shadcn Sheet has a default close button. */}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-8">
          {validItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <p className="font-serif text-2xl text-gray-300 italic">Your bag is empty.</p>
              <Button variant="link" onClick={closeCart} className="text-xs uppercase tracking-widest text-black underline underline-offset-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {validItems.map((item) => (
                <div key={item.product._id} className="flex gap-6">
                  <div className="h-24 w-20 bg-gray-50 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                      alt={item.product.name}
                      className="h-full w-full object-cover mix-blend-multiply"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm text-black leading-tight mb-1">{item.product.name}</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {item.product.category?.name}
                        </p>
                      </div>
                      <p className="text-sm font-light text-black">${item.product.price * item.quantity}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                        <button
                          className="p-1 hover:text-gray-400 transition-colors"
                          onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs w-6 text-center font-medium tabular-nums">{item.quantity}</span>
                        <button
                          className="p-1 hover:text-gray-400 transition-colors"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stock || 99)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-px"
                        onClick={() => removeFromCart(item.product._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {validItems.length > 0 && (
          <div className="border-t border-gray-100 p-8 bg-white space-y-6">
            <div className="space-y-3 text-sm font-light">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>
                  {shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-4 border-t border-gray-100">
                <span className="font-serif">Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full h-14 bg-black text-white hover:bg-gray-800 rounded-none text-xs uppercase tracking-[0.2em] font-bold transition-all" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
