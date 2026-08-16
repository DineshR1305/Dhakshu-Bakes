import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export default function GiftsPage() {
  const [giftProducts, setGiftProducts] = useState([]);

  useEffect(() => {
    async function loadGifts() {
      try {
        const res = await api.get('/products?category=gift-boxes');
        if (res.success) setGiftProducts(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadGifts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-bakery-rose px-3.5 py-1.5 rounded-full text-xs font-bold border border-rose-200">
          <Gift className="w-4 h-4" /> Celebration Hampers & Gift Boxes
        </div>
        <h1 className="font-serif text-4xl font-extrabold text-bakery-dark">CURATED BAKERY GIFTS</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Send sweet surprise hampers customized with ribbon wrapping and personalized handwritten message cards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {giftProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
