import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ShoppingBag } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-cream-100">
      <SEOHead title="403 — Access Restricted" noindex={true} />
      <div className="max-w-md w-full bg-white rounded-2xl border border-cream-200 p-8 text-center space-y-6 shadow-sm">
        
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-bakery-dark">403 — Access Restricted</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            You do not have administrative privileges to access this area. If you believe this is an error, please contact bakery support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 py-2.5 px-4 rounded-full bg-bakery-dark hover:bg-bakery text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>

          <Link
            to="/shop"
            className="flex-1 py-2.5 px-4 rounded-full bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors text-white"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Shop</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
