import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Leaf, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, removeItem } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const isWishlisted = Boolean(wishlist?.products && wishlist.products.some(p => p.id === product.id));

  const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const primaryImage = product.images && product.images.length > 0 ? product.images[0].imageUrl : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600';

  const cartItem = cart?.items?.find(
    item => item.productId === product.id && (primaryVariant ? item.variantId === primaryVariant.id : true)
  );

  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isMaxStock = Boolean(
    primaryVariant?.outOfStock ||
    (primaryVariant?.stock != null && primaryVariant.stock > 0 && quantityInCart >= primaryVariant.stock)
  );

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!primaryVariant || primaryVariant.outOfStock) return;
    const res = await addToCart(product.id, primaryVariant.id, 1);
    if (res && res.success) {
      showToast(`Added ${product.name} to cart!`, 'success');
    }
  };

  const handleIncrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem || !primaryVariant) return;
    if (isMaxStock) {
      showToast(`Maximum available stock reached for ${product.name}`, 'warning');
      return;
    }
    await updateQuantity(cartItem.id, quantityInCart + 1);
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    if (quantityInCart <= 1) {
      await removeItem(cartItem.id);
      showToast(`Removed ${product.name} from cart`, 'info');
    } else {
      await updateQuantity(cartItem.id, quantityInCart - 1);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
          decoding="async"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';
          }}
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

          {/* Pricing & Add / Quantity Controls */}
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

            {primaryVariant?.outOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-400 cursor-not-allowed">
                Out of Stock
              </span>
            ) : quantityInCart > 0 ? (
              <div
                className="inline-flex items-center bg-cream-100 border border-cream-300 rounded-full p-0.5 shadow-xs"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <button
                  onClick={handleDecrease}
                  aria-label={`Decrease quantity of ${product.name}`}
                  className="w-7 h-7 rounded-full bg-white hover:bg-cream-200 text-bakery-dark flex items-center justify-center transition-colors shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5 text-bakery-dark" />
                </button>
                <span
                  className="w-7 text-center text-xs font-extrabold text-bakery-dark select-none"
                  aria-label={`Quantity of ${product.name} in cart: ${quantityInCart}`}
                >
                  {quantityInCart}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={isMaxStock}
                  aria-label={`Increase quantity of ${product.name}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-xs ${
                    isMaxStock
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-bakery-caramel hover:bg-bakery text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdd}
                aria-label={`Add ${product.name} to cart`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cream-200 hover:bg-bakery-caramel text-bakery-dark hover:text-white transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
