
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import AuthModal from './AuthModal';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <AuthModal />
      <main className="flex-grow">
          <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
