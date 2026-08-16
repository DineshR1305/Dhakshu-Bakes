import React, { useState } from 'react';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">MY ACCOUNT</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your profile details, addresses, and order history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'profile' ? 'bg-bakery-caramel text-white' : 'text-gray-700 hover:bg-cream-100'
            }`}
          >
            <User className="w-4 h-4" /> Profile Info
          </button>
          
          <Link
            to="/orders"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-700 hover:bg-cream-100 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Order History
          </Link>

          <Link
            to="/wishlist"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-700 hover:bg-cream-100 transition-colors"
          >
            <Heart className="w-4 h-4" /> Saved Wishlist
          </Link>

          <Link
            to="/subscriptions"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-700 hover:bg-cream-100 transition-colors"
          >
            <Settings className="w-4 h-4" /> Subscriptions
          </Link>

          {user.role === 'ROLE_ADMIN' && (
            <Link
              to="/admin"
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-bakery hover:bg-cream-100 transition-colors border-t border-cream-200 mt-2 pt-3"
            >
              <Shield className="w-4 h-4 text-bakery-caramel" /> Admin Portal
            </Link>
          )}

          <button
            onClick={logout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Content Details */}
        <div className="md:col-span-3 bg-white p-8 rounded-3xl border border-cream-200 shadow-xs space-y-6">
          <h3 className="font-serif font-bold text-xl text-bakery-dark border-b border-cream-200 pb-3">Personal Profile</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Full Name</label>
              <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.fullName}</p>
            </div>
            <div>
              <label className="block font-bold text-gray-500 mb-1">Email Address</label>
              <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.email}</p>
            </div>
            <div>
              <label className="block font-bold text-gray-500 mb-1">Phone Number</label>
              <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.phone || 'Not configured'}</p>
            </div>
            <div>
              <label className="block font-bold text-gray-500 mb-1">Account Role</label>
              <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.role}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
