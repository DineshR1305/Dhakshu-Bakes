import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Leaf, ShieldCheck, Truck, Clock, Sparkles, Check } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const { addToCart } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariant(res.data.variants[0]);
          }
          if (res.data.images && res.data.images.length > 0) {
            setSelectedImage(res.data.images[0].imageUrl);
          }

          // Fetch reviews
          const revRes = await api.get(`/reviews/product/${res.data.id}`);
          if (revRes.success) setReviews(revRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-sm font-semibold text-gray-400">Loading product details...</p>
      </div>
    );
  }

  const isWishlisted = wishlist.products && wishlist.products.some(p => p.id === product.id);

  const handleAddToCart = async () => {
    if (selectedVariant) {
      const res = await addToCart(product.id, selectedVariant.id, quantity);
      if (res.success) {
        // Option to notify or navigate
      }
    }
  };

  const handleBuyNow = async () => {
    if (selectedVariant) {
      await addToCart(product.id, selectedVariant.id, quantity);
      navigate('/cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating: newRating,
        reviewText: newReviewText,
      });
      if (res.success) {
        setReviews([res.data, ...reviews]);
        setNewReviewText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Top Product Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-sm relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isEggless && (
              <span className="absolute top-4 left-4 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Pure Eggless
              </span>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img.imageUrl ? 'border-bakery-caramel scale-105' : 'border-cream-200'
                  }`}
                >
                  <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-cover" />
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
              <span className="text-xs font-bold text-bakery-dark">{product.ratingAvg}</span>
              <span className="text-xs text-gray-400">({product.reviewCount} customer reviews)</span>
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
              <span className="text-xs font-extrabold bg-bakery-rose text-white px-2 py-0.5 rounded-full">
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

          {/* Quantity & Action Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center bg-white border border-cream-300 rounded-full">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2 text-bakery-dark font-bold text-sm hover:bg-cream-100 rounded-l-full"
              >
                -
              </button>
              <span className="px-4 text-xs font-extrabold text-bakery-dark">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-2 text-bakery-dark font-bold text-sm hover:bg-cream-100 rounded-r-full"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={selectedVariant?.outOfStock}
              className="flex-1 py-3 bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{selectedVariant?.outOfStock ? 'Out of Stock' : 'Add To Cart'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={selectedVariant?.outOfStock}
              className="py-3 px-6 bg-bakery-dark hover:bg-black text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all"
            >
              Buy Now
            </button>

            <button
              onClick={() => isAuthenticated && toggleWishlist(product.id)}
              className={`p-3 rounded-full border border-cream-300 transition-colors ${
                isWishlisted ? 'bg-rose-50 text-bakery-rose' : 'bg-white text-gray-400 hover:text-bakery-rose'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-bakery-rose' : ''}`} />
            </button>
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
          {['description', 'ingredients', 'allergens', 'storage', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-bakery-caramel text-bakery-dark'
                  : 'border-transparent text-gray-400 hover:text-bakery-dark'
              }`}
            >
              {tab === 'reviews' ? `Customer Reviews (${reviews.length})` : tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="text-xs text-gray-600 leading-relaxed">
          {activeTab === 'description' && (
            <p>{product.description || 'No detailed description available.'}</p>
          )}

          {activeTab === 'ingredients' && (
            <p>{product.ingredients || 'Handcrafted using fresh milk, butter, cocoa, flour, and organic vanilla extract.'}</p>
          )}

          {activeTab === 'allergens' && (
            <p>{product.allergens || 'Contains Dairy, Gluten. Prepared in a facility that handles tree nuts.'}</p>
          )}

          {activeTab === 'storage' && (
            <p>{product.storageInstructions || 'Refrigerate at 2°C - 5°C. For best taste, bring to room temperature 15 minutes before serving.'}</p>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              
              {/* Review Form */}
              <div className="bg-cream-100/60 p-5 rounded-2xl border border-cream-200 max-w-xl">
                <h4 className="font-serif font-bold text-sm text-bakery-dark mb-3">Write a Customer Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Star Rating</label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="bg-white border border-cream-300 rounded-md px-3 py-1 text-xs"
                    >
                      <option value={5}>5 Stars — Outstanding</option>
                      <option value={4}>4 Stars — Very Good</option>
                      <option value={3}>3 Stars — Average</option>
                      <option value={2}>2 Stars — Poor</option>
                      <option value={1}>1 Star — Terrible</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      required
                      placeholder="Share your experience with this bake..."
                      rows={3}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full p-2.5 bg-white border border-cream-300 rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-bakery-dark text-white font-bold text-xs rounded-full hover:bg-bakery"
                  >
                    Submit Review
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-cream-50 rounded-xl border border-cream-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-bakery-dark text-xs">{r.userName}</span>
                      <div className="flex text-amber-400 text-xs">{'★'.repeat(r.rating)}</div>
                    </div>
                    <p className="text-xs text-gray-600">{r.reviewText}</p>
                    <span className="text-[10px] text-gray-400 block mt-1">Verified Purchase</span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
