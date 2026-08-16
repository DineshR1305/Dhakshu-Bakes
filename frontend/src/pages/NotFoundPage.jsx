import React from 'react';
import { Link } from 'react-router-dom';
import { Cake, ShoppingBag, Home, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-cream-100">
      <SEOHead title="404 — Page Not Found" noindex={true} />
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-cream-200 shadow-xl text-center space-y-6">
        
        {/* Animated 404 Badge */}
        <div className="relative inline-block">
          <span className="font-serif text-8xl sm:text-9xl font-extrabold text-cream-200 tracking-wider">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-bakery-caramel text-white flex items-center justify-center shadow-lg animate-bounce">
              <Cake className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-dark">
            404 — Bake Not Found!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            The page or bakery delicacy you are searching for doesn't exist. Don't worry, our oven is full of fresh cakes waiting for you!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-bakery-dark text-white font-bold text-xs hover:bg-bakery flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-bakery-caramel text-white font-bold text-xs hover:bg-bakery flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Bakery Shop</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
