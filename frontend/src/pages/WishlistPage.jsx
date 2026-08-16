import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { useWishlistStore } from '../store/wishlistStore';

export default function WishlistPage() {
  const { wishlist } = useWishlistStore();

  if (!wishlist.products || wishlist.products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 text-bakery-rose rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">Your Wishlist is Empty</h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">Save your favorite cakes and treats here for future celebrations.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-bakery-dark text-white font-bold text-xs rounded-full hover:bg-bakery">
          <span>Explore Bakery Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEOHead title="Saved Wishlist" noindex={true} />
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-dark">MY WISHLIST</h1>
        <p className="text-xs text-gray-500 mt-1">Saved items ready for your next party or celebration.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
