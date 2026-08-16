import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AccountPage from './pages/AccountPage';
import GiftsPage from './pages/GiftsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import StoreLocatorPage from './pages/StoreLocatorPage';
import WholesalePage from './pages/WholesalePage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages & Layout
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminCouponsPage from './pages/AdminCouponsPage';

import { useAuthStore } from './store/authStore';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            {/* Storefront Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/gifts" element={<GiftsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/stores" element={<StoreLocatorPage />} />
            <Route path="/wholesale" element={<WholesalePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Administrative Panel Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
