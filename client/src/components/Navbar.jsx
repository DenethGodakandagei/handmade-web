import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { openCart, items } = useCartStore();
  const { user, logout, openAuthModal, isAuthenticated } = useAuthStore();
  
  const validItems = Array.isArray(items) ? items.filter(item => item && item.product) : [];
  const totalItems = validItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled ? 'bg-white/80 backdrop-blur-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="px-6 md:px-12 grid grid-cols-12 items-center">
        
        {/* Left Nav */}
        <nav className="col-span-4 hidden md:flex items-center space-x-8">
          <Link to="/products" className="text-xs font-medium uppercase tracking-[0.1em] text-black hover:opacity-50 transition-opacity">
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
               </SheetHeader>
               <div className="flex flex-col gap-6">
                  <Link to="/" className="text-2xl font-light tracking-tight">Index</Link>
                  <Link to="/products" className="text-2xl font-light tracking-tight">Collection</Link>
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
          <button className="hidden sm:block text-black hover:opacity-50 transition-opacity">
            <Search className="w-4 h-4" />
          </button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-auto p-0 hover:bg-transparent">
                  <User className="w-5 h-5 text-black hover:opacity-50 transition-opacity" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-none shadow-xl bg-white rounded-sm p-2">
                <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/orders">Orders</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
