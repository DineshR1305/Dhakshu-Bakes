import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Leaf } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const isWishlisted = wishlist.products && wishlist.products.some(p => p.id === product.id);

  const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const primaryImage = product.images && product.images.length > 0 ? product.images[0].imageUrl : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600';

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (primaryVariant) {
      const res = await addToCart(product.id, primaryVariant.id, 1);
      showToast(`Added ${product.name} to cart!`, 'success');
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      toggleWishlist(product.id);
      showToast(isWishlisted ? `Removed ${product.name} from wishlist` : `Added ${product.name} to wishlist!`, 'info');
    } else {
      showToast('Please sign in to save items to your wishlist', 'warning');
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-cream-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isEggless && (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            <Leaf className="w-3 h-3 text-emerald-600" />
            Pure Eggless
          </span>
        )}
        {product.isBestseller && (
          <span className="bg-bakery-gold text-bakery-dark text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            Bestseller
          </span>
        )}
      </div>

      {/* Wishlist Button Overlay */}
      <button
        onClick={handleWishlist}
        aria-label={isWishlisted ? `Remove ${product.name} from Wishlist` : `Add ${product.name} to Wishlist`}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-cream-200 flex items-center justify-center transition-all ${
          isWishlisted ? 'text-bakery-rose bg-rose-50' : 'text-gray-400 hover:text-bakery-rose hover:bg-white'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-bakery-rose' : ''}`} />
      </button>

      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-cream-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-bakery-caramel uppercase tracking-widest block mb-1">
            {product.categoryName}
          </span>
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base font-bold text-bakery-dark group-hover:text-bakery transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
            {product.description}
          </p>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-bakery-dark">{product.ratingAvg || 5.0}</span>
            <span className="text-[11px] text-gray-500 font-medium">({product.reviewCount || 0})</span>
          </div>

          {/* Pricing & Add Button */}
          <div className="flex items-center justify-between pt-2 border-t border-cream-100">
            <div>
              {primaryVariant ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold text-bakery-dark">
                    ₹{primaryVariant.discountPrice || primaryVariant.price}
                  </span>
                  {primaryVariant.discountPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{primaryVariant.price}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm font-semibold text-gray-500">Select Variant</span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={primaryVariant?.outOfStock}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                primaryVariant?.outOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-cream-200 hover:bg-bakery-caramel text-bakery-dark hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{primaryVariant?.outOfStock ? 'Out of Stock' : 'Add'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

