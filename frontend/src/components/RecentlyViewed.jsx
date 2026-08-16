import React, { useEffect, useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { getRecentlyViewed } from '../utils/recentlyViewed';

export default function RecentlyViewed({ currentProductId = null, className = '' }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const list = getRecentlyViewed();
    const filtered = currentProductId ? list.filter(p => p.id !== currentProductId) : list;
    setItems(filtered);
  }, [currentProductId]);

  if (!items || items.length === 0) return null;

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cream-100 border border-cream-300 flex items-center justify-center text-bakery-caramel">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-bakery-dark">Recently Viewed Treats</h2>
            <p className="text-xs text-gray-500">Pick up right where you left off</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-bakery-caramel hidden sm:inline flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Freshly Bakes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
