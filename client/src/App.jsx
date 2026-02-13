import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Artisans from './pages/Artisans';
import ArtisanApplication from './pages/ArtisanApplication';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import ArtisanDashboard from './pages/ArtisanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Contact from './pages/Contact';
import Support from './pages/Support';
import useAuthStore from './store/authStore';
import { Toaster } from '@/components/ui/sonner';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
    </div>
  );
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" />;
  
  return children;
};

function App() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen relative font-sans antialiased text-gray-900 selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <CartSidebar />
      <AuthModal />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artisans" element={<Artisans />} />
          <Route path="/artisans/apply" element={<ArtisanApplication />} />
          
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          
          {/* Dashboard Routes (Unified via Layout inside components) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['artisan']}>
                <ArtisanDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" expand={false} richColors />
    </div>
  );
}

export default App;
