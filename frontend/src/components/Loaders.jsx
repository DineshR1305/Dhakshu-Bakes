import React from 'react';
import { Cake, Loader2 } from 'lucide-react';

export function PageLoader({ text = 'Baking awesome things for you...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-bakery-light border-2 border-bakery-caramel flex items-center justify-center animate-pulse">
          <Cake className="w-8 h-8 text-bakery-rose" />
        </div>
        <div className="absolute -inset-2 border-2 border-bakery-caramel border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="font-serif text-xs font-semibold text-bakery-caramel tracking-wide uppercase">
        {text}
      </p>
    </div>
  );
}

export function ButtonLoader({ text = 'Processing...' }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-current" />
      <span>{text}</span>
    </div>
  );
}

export function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-cream-200 shadow-xs space-y-3 animate-pulse">
            <div className="w-full h-48 bg-cream-200 rounded-xl"></div>
            <div className="h-4 bg-cream-200 rounded w-3/4"></div>
            <div className="h-3 bg-cream-100 rounded w-1/2"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 bg-cream-200 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-cream-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="h-4 bg-cream-200 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-12 bg-cream-200 rounded-xl animate-pulse"></div>
  );
}
