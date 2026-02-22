import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, User } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { openCart, items } = useCartStore();
  const { user, logout, openAuthModal, isAuthenticated } = useAuthStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = () => {
      setIsSheetOpen(false);
      logout();
  }

  const validItems = Array.isArray(items) ? items.filter(item => item && item.product) : [];
  const totalItems = validItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[padding-top,padding-bottom,background-color,backdrop-filter,box-shadow] duration-500 ease-out ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}
      style={{ paddingRight: 'var(--removed-body-scroll-bar-size)' }}
    >
      <div className="px-6 md:px-12 grid grid-cols-12 items-center">

        {/* Left Nav */}
        <nav className="col-span-4 hidden md:flex items-center space-x-8">
          <Link to="/collection" className="text-xs font-medium uppercase tracking-[0.1em] text-black hover:opacity-50 transition-opacity">
            Collection
          </Link>
          <Link to="/artisans" className="text-xs font-medium uppercase tracking-[0.1em] text-black hover:opacity-50 transition-opacity">
            Artisans
          </Link>
        </nav>

        {/* Mobile Trigger */}
        <div className="col-span-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
                <Menu className="w-5 h-5 text-black" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[300px] border-none bg-white p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="font-medium text-2xl text-left tracking-tight">Men.</SheetTitle>
                <SheetDescription className="hidden">
                  Navigation menu for mobile.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                <Link to="/" className="text-2xl font-light tracking-tight">Index</Link>
                <Link to="/collection" className="text-2xl font-light tracking-tight">Collection</Link>
                <Link to="/about" className="text-2xl font-light tracking-tight">Philosophy</Link>
                <div className="h-px bg-gray-100 my-2" />
                {!isAuthenticated && (
                  <button onClick={() => openAuthModal('login')} className="text-sm font-medium uppercase tracking-widest text-left">
                    Account
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center Logo */}
        <div className="col-span-8 md:col-span-4 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-xl md:text-2xl font-medium tracking-tighter text-black">
              ARTISAN.
            </h1>
          </Link>
        </div>

        {/* Right Nav */}
        <div className="col-span-2 md:col-span-4 flex items-center justify-end space-x-6">
          {isAuthenticated ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-auto p-0 hover:bg-transparent cursor-pointer">
                  <User className="w-5 h-5 text-black hover:opacity-50 transition-opacity" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md border-l border-gray-100 bg-white p-10 flex flex-col h-full data-[state=open]:duration-500">
                 <SheetHeader className="mb-12 text-left">
                   <SheetTitle className="font-serif italic text-3xl font-light">Account.</SheetTitle>
                   <SheetDescription className="text-gray-400 text-xs tracking-widest uppercase">
                      Welcome back, {user?.name || 'Artisan'}
                   </SheetDescription>
                 </SheetHeader>

                 <div className="flex-1 flex flex-col space-y-8">
                    <Link onClick={() => setIsSheetOpen(false)} to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-light hover:translate-x-2 transition-transform duration-300 cursor-pointer">
                      {user?.role === 'admin' ? 'Admin Core' : 'Dashboard'}
                    </Link>
                    <Link onClick={() => setIsSheetOpen(false)} to="/profile" className="text-xl font-light hover:translate-x-2 transition-transform duration-300 cursor-pointer">Profile</Link>
                    {user?.role !== 'admin' && (
                      <Link onClick={() => setIsSheetOpen(false)} to="/artisans/apply" className="text-xl font-light hover:translate-x-2 transition-transform duration-300 opacity-50 cursor-pointer">Sell on Guild</Link>
                    )}
                 </div>

                 <div className="mt-auto pt-8 border-t border-gray-100">
                    <button onClick={handleLogout} className="text-xs uppercase tracking-[0.2em] font-bold text-black hover:text-red-500 transition-colors cursor-pointer">
                       Log Out
                    </button>
                 </div>
              </SheetContent>
            </Sheet>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="hidden sm:block hover:opacity-50 transition-opacity"
            >
              <User className="w-5 h-5 text-black" />
            </button>
          )}

          <button onClick={openCart} className="relative hover:opacity-50 transition-opacity">
            <ShoppingBag className="w-5 h-5 text-black" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
