import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderSubtotal: cart.subtotal,
      });

      if (res.success && res.data.valid) {
        setCouponDiscount(res.data.calculatedDiscount);
        setCouponMessage({ type: 'success', text: res.data.message });
        localStorage.setItem('dhakshu_applied_coupon', couponCode.trim());
      } else {
        setCouponDiscount(0);
        setCouponMessage({ type: 'error', text: res.data?.message || 'Invalid coupon code' });
      }
    } catch (err) {
      setCouponDiscount(0);
      setCouponMessage({ type: 'error', text: err.message });
    }
  };

  const deliveryFee = cart.subtotal >= 499 || cart.subtotal === 0 ? 0 : 50;
  const totalAmount = Math.max(0, cart.subtotal - couponDiscount + deliveryFee);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-cream-200 text-bakery-caramel rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-bakery-dark">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">Looks like you haven't added any fresh baked treats to your cart yet.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3 bg-bakery-dark text-white font-bold text-xs rounded-full hover:bg-bakery"
        >
          <span>Browse Fresh Bakery Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-dark">SHOPPING CART</h1>
        <p className="text-xs text-gray-500 mt-1">Review your selected items before proceeding to checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}
                  alt={item.productName}
                  className="w-20 h-20 rounded-xl object-cover border border-cream-200 flex-shrink-0"
                />
                <div>
                  <Link to={`/product/${item.productSlug}`} className="font-serif font-bold text-sm text-bakery-dark hover:text-bakery">
                    {item.productName}
                  </Link>
                  <p className="text-xs text-bakery-caramel font-semibold">{item.variantName}</p>
                  <p className="text-xs font-bold text-bakery-dark mt-1">₹{item.unitPrice}</p>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-cream-100">
                <div className="flex items-center bg-cream-100 border border-cream-300 rounded-full">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 font-bold text-xs hover:bg-cream-200 rounded-l-full"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-bakery-dark">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 font-bold text-xs hover:bg-cream-200 rounded-r-full"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-bakery-dark">₹{item.totalPrice}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 mt-0.5 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs h-fit space-y-6">
          <h3 className="font-serif text-lg font-bold text-bakery-dark border-b border-cream-200 pb-3">Order Summary</h3>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block">Apply Coupon Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg uppercase font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-bakery-dark text-white text-xs font-bold rounded-lg hover:bg-bakery"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className={`text-[11px] font-semibold ${couponMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {couponMessage.text}
              </p>
            )}
          </form>

          {/* Cost Breakdown */}
          <div className="space-y-2.5 text-xs border-t border-cream-200 pt-4">
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
                {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="border-t border-cream-200 pt-3 flex justify-between text-base font-extrabold text-bakery-dark">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3.5 bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-Bit Razorpay Payments</span>
          </div>

        </div>

      </div>
    </div>
  );
}
