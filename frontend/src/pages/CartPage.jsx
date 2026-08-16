import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, ShieldCheck, Tag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SEOHead from '../components/SEOHead';
import FreeDeliveryProgress from '../components/FreeDeliveryProgress';
import CouponSection from '../components/CouponSection';
import { ButtonLoader } from '../components/Loaders';
import api from '../services/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { showToast } = useToast();

  const [appliedCoupon, setAppliedCoupon] = useState(localStorage.getItem('dhakshu_applied_coupon') || '');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Modals
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    if (appliedCoupon && cart.subtotal > 0) {
      validateStoredCoupon(appliedCoupon);
    } else {
      setCouponDiscount(0);
    }
  }, [cart.subtotal, appliedCoupon]);

  const validateStoredCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/validate', {
        code,
        orderSubtotal: cart.subtotal,
      });

      if (res.success && res.data && res.data.valid) {
        setCouponDiscount(res.data.calculatedDiscount);
      } else {
        setCouponDiscount(0);
        setAppliedCoupon('');
        localStorage.removeItem('dhakshu_applied_coupon');
      }
    } catch (e) {
      setCouponDiscount(0);
    }
  };

  const handleCouponApplied = (code, discount) => {
    setAppliedCoupon(code);
    setCouponDiscount(discount);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon('');
    setCouponDiscount(0);
  };

  const handleConfirmRemoveItem = async () => {
    if (!itemToRemove) return;
    await removeItem(itemToRemove.id);
    showToast(`Removed ${itemToRemove.productName} from cart`, 'info');
    setItemToRemove(null);
  };

  const handleConfirmClearCart = async () => {
    await clearCart();
    localStorage.removeItem('dhakshu_applied_coupon');
    setAppliedCoupon('');
    setCouponDiscount(0);
    showToast('Shopping cart cleared', 'info');
    setShowClearCartModal(false);
  };

  const deliveryFee = cart.subtotal >= 499 || cart.subtotal === 0 ? 0 : 50;
  const totalAmount = Math.max(0, cart.subtotal - couponDiscount + deliveryFee);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <SEOHead title="Shopping Cart" noindex={true} />
        <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto text-bakery-caramel">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">Your Cart is Empty</h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">Add freshly baked handcrafted cakes, cookies, and breads to your cart.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full shadow-md transition-colors"
        >
          <span>Explore Fresh Bakery Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SEOHead title="Shopping Cart" noindex={true} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-dark">SHOPPING CART</h1>
          <p className="text-xs text-gray-500 mt-1">Review your selected items before proceeding to checkout.</p>
        </div>

        <button
          onClick={() => setShowClearCartModal(true)}
          className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <FreeDeliveryProgress subtotal={cart.subtotal} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3.5 sm:p-4 rounded-2xl border border-cream-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}
                  alt={item.productName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-cream-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productSlug}`} className="font-serif font-bold text-xs sm:text-sm text-bakery-dark hover:text-bakery truncate block">
                    {item.productName}
                  </Link>
                  <p className="text-[11px] sm:text-xs text-bakery-caramel font-semibold">{item.variantName}</p>
                  {/* Customization Badges & Notes */}
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {item.isEggless && (
                      <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Eggless</span>
                    )}
                    {item.isGiftWrapped && (
                      <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Gift Wrapped</span>
                    )}
                  </div>

                  {item.customMessage && (
                    <p className="text-[10px] text-gray-600 font-medium mt-1 bg-cream-50 px-2 py-0.5 rounded border border-cream-200">
                      <strong className="text-bakery-dark">Message:</strong> "{item.customMessage}"
                    </p>
                  )}

                  {item.specialInstructions && (
                    <p className="text-[10px] text-gray-500 italic mt-0.5">
                      Note: {item.specialInstructions}
                    </p>
                  )}

                  <p className="text-xs font-bold text-bakery-dark mt-1">₹{item.unitPrice}</p>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-cream-100">
                <div className="flex items-center bg-cream-100 border border-cream-300 rounded-full">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                    className="px-3 py-1 font-bold text-xs hover:bg-cream-200 rounded-l-full min-h-[36px]"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-bold text-xs text-bakery-dark">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                    className="px-3 py-1 font-bold text-xs hover:bg-cream-200 rounded-r-full min-h-[36px]"
                  >
                    +
                  </button>
                </div>

                <div className="text-right flex items-center gap-3">
                  <span className="font-bold text-xs sm:text-sm text-bakery-dark">₹{item.totalPrice}</span>
                  <button
                    onClick={() => setItemToRemove(item)}
                    aria-label="Remove item"
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-bakery-caramel hover:text-bakery transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Sidebar Summary & Coupons */}
        <div className="space-y-6">
          {/* Reusable Coupon Section */}
          <CouponSection
            subtotal={cart.subtotal}
            appliedCoupon={appliedCoupon}
            appliedDiscount={couponDiscount}
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
          />

          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-6">
            <h3 className="font-serif text-lg font-bold text-bakery-dark border-b border-cream-200 pb-3">Order Summary</h3>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-bold text-bakery-dark">₹{cart.subtotal}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-bakery-dark">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-cream-200 pt-3 flex justify-between text-base font-extrabold text-bakery-dark">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Fresh Bake & Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Confirm Remove Item Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        title="Remove Item from Cart?"
        message={`Are you sure you want to remove ${itemToRemove?.productName} (${itemToRemove?.variantName}) from your shopping cart?`}
        confirmText="Remove Item"
        cancelText="Keep Item"
        isDanger={true}
        onConfirm={handleConfirmRemoveItem}
        onCancel={() => setItemToRemove(null)}
      />

      {/* Confirm Clear Cart Modal */}
      <ConfirmModal
        isOpen={showClearCartModal}
        title="Clear Entire Shopping Cart?"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmClearCart}
        onCancel={() => setShowClearCartModal(false)}
      />
    </div>
  );
}
