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
import ProtectedSellerRoute from './components/ProtectedSellerRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Products from './pages/dashboard/Products';
import Orders from './pages/dashboard/Orders';
import Settings from './pages/dashboard/Settings';
import Storefront from './pages/dashboard/Storefront';
import Messages from './pages/dashboard/Messages';
import Customizations from './pages/dashboard/Customizations';
import MainLayout from './components/MainLayout';
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
        <Routes>
          {/* Main Public Layout */}
          <Route element={<MainLayout />}>
             <Route path="/" element={<Home />} />
             <Route path="/artisans" element={<Artisans />} />
             <Route path="/artisans/apply" element={<ArtisanApplication />} />
             <Route path="/products" element={<ProductList />} />
             <Route path="/products/:id" element={<ProductDetails />} />
             <Route path="/contact" element={<Contact />} />
             <Route path="/support" element={<Support />} />
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
          </Route>

          {/* Dashboard Layouts */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedSellerRoute>
                 <DashboardLayout />
              </ProtectedSellerRoute>
            } 
          >
             <Route index element={<Overview />} />
             <Route path="products" element={<Products />} />
             <Route path="orders" element={<Orders />} />
             <Route path="customizations" element={<Customizations />} />
             <Route path="settings" element={<Settings />} />
             <Route path="storefront" element={<Storefront />} />
             <Route path="messages" element={<Messages />} />
          </Route>

           <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      <Toaster position="bottom-right" expand={false} richColors />
    </div>
  );
}

export default App;
