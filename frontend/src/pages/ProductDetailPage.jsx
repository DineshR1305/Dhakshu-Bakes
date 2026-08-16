import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Leaf, ShieldCheck, Truck, ChevronLeft, ChevronRight, ZoomIn, Plus, Minus, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import SEOHead from '../components/SEOHead';
import { PageLoader } from '../components/Loaders';
import NotFoundPage from './NotFoundPage';
import ImageLightboxModal from '../components/ImageLightboxModal';
import RecentlyViewed from '../components/RecentlyViewed';
import RelatedProducts from '../components/RelatedProducts';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import ProductReviewsSection from '../components/ProductReviewsSection';
import api from '../services/api';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Customization State
  const [customMessage, setCustomMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isEggless, setIsEggless] = useState(false);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { cart, addToCart, updateQuantity, removeItem, openDrawer } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setNotFound(false);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res && res.success && res.data) {
          const prod = res.data;
          setProduct(prod);

          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          } else {
            setSelectedVariant(null);
          }

          setActiveImageIndex(0);

          // Add to recently viewed localStorage
          addRecentlyViewed(prod);

          // Fetch reviews safely
          try {
            const revRes = await api.get(`/reviews/product/${prod.id}`);
            if (revRes && revRes.success && Array.isArray(revRes.data)) {
              setReviews(revRes.data);
            }
          } catch (e) {
            console.error('Failed to fetch product reviews:', e);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return <PageLoader text="Loading fresh bake details..." />;
  }

  if (notFound || !product) {
    return <NotFoundPage />;
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    { id: 1, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', altText: product.name }
  ];

  const currentImage = images[activeImageIndex]?.imageUrl || images[0].imageUrl;

  const isWishlisted = Boolean(wishlist?.products && wishlist.products.some(p => p.id === product.id));

  // Derive cart item for selected variant
  const cartItem = cart?.items?.find(
    item => item.productId === product.id && (selectedVariant ? item.variantId === selectedVariant.id : true)
  );

  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isMaxStock = Boolean(
    selectedVariant?.outOfStock ||
    (selectedVariant?.stock != null && selectedVariant.stock > 0 && quantityInCart >= selectedVariant.stock)
  );

  const handleAddToCart = async () => {
    if (selectedVariant && product) {
      if (isMaxStock) {
        showToast(`Maximum available stock reached for ${product.name}`, 'warning');
        return;
      }
      const customization = { customMessage, specialInstructions, isEggless, isGiftWrapped };
      const res = await addToCart(product.id, selectedVariant.id, quantity, customization);
      if (res && res.success) {
        showToast(`Added ${product.name} to cart!`, 'success');
        openDrawer();
      }
    }
  };

  const handleBuyNow = async () => {
    if (selectedVariant && product) {
      const customization = { customMessage, specialInstructions, isEggless, isGiftWrapped };
      const res = await addToCart(product.id, selectedVariant.id, quantity, customization);
      if (res && res.success) {
        navigate('/cart');
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to submit a customer review', 'warning');
      navigate('/login');
      return;
    }
    if (!newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating: newRating,
        reviewText: newReviewText.trim(),
      });
      if (res && res.success && res.data) {
        setReviews([res.data, ...reviews]);
        setNewReviewText('');
        showToast('Thank you! Your review has been submitted for moderation.', 'success');
      }
    } catch (e) {
      showToast(e.message || 'Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Build list of valid information tabs dynamically
  const availableTabs = [
    { key: 'description', label: 'Description', show: Boolean(product.description) },
    { key: 'ingredients', label: 'Ingredients', show: Boolean(product.ingredients) },
    { key: 'allergens', label: 'Allergens', show: Boolean(product.allergens) },
    { key: 'nutrition', label: 'Nutritional Info', show: Boolean(product.nutritionFacts) },
    { key: 'storage', label: 'Storage & Shelf Life', show: Boolean(product.storageInstructions) },
    { key: 'delivery', label: 'Delivery Info', show: Boolean(product.deliveryInfo) },
    { key: 'reviews', label: `Reviews (${reviews.length})`, show: true },
  ].filter(t => t.show);

  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': currentImage,
    'offers': {
      '@type': 'Offer',
      'price': selectedVariant?.discountPrice || selectedVariant?.price || 0,
      'priceCurrency': 'INR',
      'availability': selectedVariant?.outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      'url': `${window.location.origin}/product/${product.slug}`
    },
    'aggregateRating': (product.ratingAvg && product.reviewCount && product.reviewCount > 0) ? {
      '@type': 'AggregateRating',
      'ratingValue': product.ratingAvg,
      'reviewCount': product.reviewCount
    } : undefined
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title={product.name}
        description={product.description}
        image={currentImage}
        type="product"
        jsonLd={productSchema}
      />
      
      {/* Top Product Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Image Gallery with Lightbox & Nav Controls */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-sm relative group">
            <img
              src={currentImage}
              alt={images[activeImageIndex]?.altText || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';
              }}
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isEggless && (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-xs">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Pure Eggless
                </span>
              )}
              {product.isBestseller && (
                <span className="bg-bakery-gold text-bakery-dark text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                  Bestseller
                </span>
              )}
            </div>

            {/* Lightbox Zoom Trigger */}
            <button
              onClick={() => setLightboxOpen(true)}
              aria-label="Inspect product image fullscreen"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-bakery-dark hover:bg-white transition-all shadow-md focus:ring-2 focus:ring-bakery-caramel"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Previous / Next Arrow Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-bakery-dark shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-bakery-dark shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Image Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Select product image ${idx + 1}`}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx ? 'border-bakery-caramel scale-105 shadow-xs' : 'border-cream-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt={img.altText || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-bakery-caramel uppercase tracking-widest block mb-1">
              {product.categoryName}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-bakery-dark">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {'★'.repeat(Math.round(product.ratingAvg || 5))}
              </div>
              <span className="text-xs font-bold text-bakery-dark">{product.ratingAvg || 5.0}</span>
              <span className="text-xs text-gray-500 font-medium">({product.reviewCount || 0} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-cream-100/60 rounded-2xl border border-cream-200 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-bakery-dark">
              ₹{selectedVariant?.discountPrice || selectedVariant?.price || 0}
            </span>
            {selectedVariant?.discountPrice && (
              <span className="text-sm font-semibold text-gray-400 line-through">
                ₹{selectedVariant.price}
              </span>
            )}
            {selectedVariant?.discountPrice && (
              <span className="text-xs font-extrabold bg-bakery-rose text-white px-2.5 py-1 rounded-full shadow-2xs">
                SAVE ₹{selectedVariant.price - selectedVariant.discountPrice}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block mb-2">
                Select Weight / Size Variant
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedVariant?.id === v.id
                        ? 'bg-bakery-dark text-white border-bakery-dark shadow-xs'
                        : 'bg-white text-bakery-dark border-cream-300 hover:border-bakery-caramel'
                    }`}
                  >
                    {v.variantName} — ₹{v.discountPrice || v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bakery Order Customization Section */}
          {(product.customMessageAllowed || product.specialInstructionsAllowed || product.egglessAllowed || product.giftWrapAllowed) && (
            <div className="bg-cream-100/70 p-4 sm:p-5 rounded-2xl border border-cream-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-cream-200 pb-2">
                <Sparkles className="w-4 h-4 text-bakery-caramel" />
                <h3 className="font-serif font-bold text-xs sm:text-sm text-bakery-dark uppercase tracking-wider">Customize Your Order</h3>
              </div>

              {/* Custom Cake / Product Message */}
              {product.customMessageAllowed && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-gray-700">Custom Cake Message <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <span className="text-[10px] font-bold text-gray-400">{200 - customMessage.length} left</span>
                  </div>
                  <input
                    type="text"
                    maxLength={200}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g. Happy 20th Birthday Dhakshu! 🎉"
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs text-bakery-dark font-medium focus:ring-2 focus:ring-bakery-caramel"
                  />
                </div>
              )}

              {/* Special Baking Instructions */}
              {product.specialInstructionsAllowed && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-gray-700">Special Instructions <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <span className="text-[10px] font-bold text-gray-400">{500 - specialInstructions.length} left</span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Please write name in dark chocolate & keep icing light..."
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs text-bakery-dark font-medium focus:ring-2 focus:ring-bakery-caramel"
                  />
                </div>
              )}

              {/* Eggless & Gift Wrap Options */}
              <div className="flex flex-wrap gap-4 pt-1">
                {product.egglessAllowed && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-bakery-dark select-none">
                    <input
                      type="checkbox"
                      checked={isEggless}
                      onChange={(e) => setIsEggless(e.target.checked)}
                      className="w-4 h-4 text-bakery-caramel border-cream-300 rounded focus:ring-bakery-caramel"
                    />
                    <span>100% Eggless Option</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md">
                      +₹{product.egglessSurcharge || 50}
                    </span>
                  </label>
                )}

                {product.giftWrapAllowed && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-bakery-dark select-none">
                    <input
                      type="checkbox"
                      checked={isGiftWrapped}
                      onChange={(e) => setIsGiftWrapped(e.target.checked)}
                      className="w-4 h-4 text-bakery-caramel border-cream-300 rounded focus:ring-bakery-caramel"
                    />
                    <span>Premium Gift Packaging</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-md">
                      +₹{product.giftWrapFee || 30}
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Quantity Input Selector */}
              <div className="flex items-center bg-white border border-cream-300 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-2.5 text-bakery-dark font-bold text-sm hover:bg-cream-100 rounded-l-full min-h-[44px]"
                >
                  -
                </button>
                <span className="px-4 text-xs font-extrabold text-bakery-dark">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  className="px-3.5 py-2.5 text-bakery-dark font-bold text-sm hover:bg-cream-100 rounded-r-full min-h-[44px]"
                >
                  +
                </button>
              </div>

              {/* Add To Cart */}
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant?.outOfStock || isMaxStock}
                className={`w-full sm:flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                  selectedVariant?.outOfStock || isMaxStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-bakery-caramel hover:bg-bakery text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{selectedVariant?.outOfStock ? 'Out of Stock' : isMaxStock ? 'Max Stock Reached' : 'Add To Cart'}</span>
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={selectedVariant?.outOfStock || isMaxStock}
                className="w-full sm:w-auto py-3 px-6 bg-bakery-dark hover:bg-black text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all min-h-[44px] disabled:opacity-50"
              >
                Buy Now
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => isAuthenticated && toggleWishlist(product.id)}
                aria-label={isWishlisted ? `Remove ${product.name} from Wishlist` : `Add ${product.name} to Wishlist`}
                className={`p-3 rounded-full border border-cream-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isWishlisted ? 'bg-rose-50 text-bakery-rose' : 'bg-white text-gray-400 hover:text-bakery-rose'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-bakery-rose' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cream-200">
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-bakery-caramel" />
              <span>FSSAI Certified Bakery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <Truck className="w-4 h-4 text-bakery-caramel" />
              <span>Same-Day Fresh Delivery</span>
            </div>
          </div>

        </div>

      </div>

      {/* Information Tabs & Reviews Section */}
      <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-xs">
        
        <div className="flex border-b border-cream-200 gap-6 text-sm font-serif font-bold mb-6 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 capitalize transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-bakery-caramel text-bakery-dark'
                  : 'border-transparent text-gray-400 hover:text-bakery-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="text-xs text-gray-600 leading-relaxed">
          {activeTab === 'description' && (
            <p>{product.description || 'No detailed description available.'}</p>
          )}

          {activeTab === 'ingredients' && (
            <p>{product.ingredients}</p>
          )}

          {activeTab === 'allergens' && (
            <p>{product.allergens}</p>
          )}

          {activeTab === 'nutrition' && (
            <p>{product.nutritionFacts}</p>
          )}

          {activeTab === 'storage' && (
            <p>{product.storageInstructions}</p>
          )}

          {activeTab === 'delivery' && (
            <p>{product.deliveryInfo}</p>
          )}

          {activeTab === 'reviews' && (
            <ProductReviewsSection productId={product.id} productName={product.name} />
          )}
        </div>

      </div>

      {/* Related Products Section */}
      <RelatedProducts
        currentProduct={product}
        categoryId={product.categoryId}
        categoryName={product.categoryName}
        className="pt-6 border-t border-cream-200"
      />

      {/* Recently Viewed Products Section */}
      <RecentlyViewed currentProductId={product.id} className="pt-6 border-t border-cream-200" />

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        currentIndex={activeImageIndex}
        onSelectIndex={setActiveImageIndex}
        altText={product.name}
      />
    </div>
  );
}
