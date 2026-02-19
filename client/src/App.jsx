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
import RequestCustomization from './pages/RequestCustomization';
import ProtectedSellerRoute from './components/ProtectedSellerRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Products from './pages/dashboard/Products';
import Orders from './pages/dashboard/Orders';
import Settings from './pages/dashboard/Settings';
import Storefront from './pages/dashboard/Storefront';
import Messages from './pages/dashboard/Messages';
import Customizations from './pages/dashboard/Customizations';
import AddProduct from './pages/dashboard/AddProduct';
import MainLayout from './components/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancel from './pages/OrderCancel';
import Contact from './pages/Contact';
import Support from './pages/Support';
import useAuthStore from './store/authStore';
import { Toaster } from '@/components/ui/sonner';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';

import ProtectedRoute from './components/ProtectedRoute';

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
          <Route path="/collection" element={<ProductList />} />
          <Route path="/collection/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          {/* Orders route removed as per request */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-cancel"
            element={
              <ProtectedRoute>
                <OrderCancel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customizations/new/:id"
            element={
              <ProtectedRoute>
                <RequestCustomization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* /dashboard/orders — accessible to ALL logged-in users (buyers + sellers) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* Full Dashboard — sellers/artisans only */}
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
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
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
