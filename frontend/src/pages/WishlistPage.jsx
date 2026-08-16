import React from 'react';
import { Heart, ArrowRight, ShoppingBag, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../context/ToastContext';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addToCart, openDrawer } = useCartStore();
  const { showToast } = useToast();

  const products = wishlist.products || [];

  const handleMoveToCart = async (product) => {
    const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    if (!primaryVariant) {
      showToast('Product variants unavailable', 'warning');
      return;
    }

    if (primaryVariant.inventory && primaryVariant.inventory.isOutOfStock) {
      showToast(`${product.name} is currently out of stock`, 'warning');
      return;
    }

    const res = await addToCart(product.id, primaryVariant.id, 1);
    if (res && res.success) {
      toggleWishlist(product);
      showToast(`Moved ${product.name} to cart!`, 'success');
      openDrawer();
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <SEOHead title="Saved Wishlist" noindex={true} />
        <div className="w-20 h-20 bg-rose-50 text-bakery-rose rounded-full flex items-center justify-center mx-auto shadow-xs">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">Your Wishlist is Empty</h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">Save your favorite handcrafted cakes and artisanal treats here for future celebrations.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full transition-colors shadow-md">
          <span>Explore Bakery Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SEOHead title="Saved Wishlist" noindex={true} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-dark">MY WISHLIST</h1>
          <p className="text-xs text-gray-500 mt-1">Saved items ({products.length}) ready for your next party or celebration.</p>
        </div>
        <Link to="/shop" className="text-xs font-bold text-bakery-caramel hover:underline flex items-center gap-1">
          <span>Continue Browsing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => handleMoveToCart(product)}
                className="flex-1 py-2 bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Remove from wishlist"
                className="p-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
