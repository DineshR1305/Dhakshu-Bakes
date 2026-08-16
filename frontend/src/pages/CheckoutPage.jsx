import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Calendar, Clock, Gift, CreditCard, Lock, CheckCircle, Tag, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SEOHead from '../components/SEOHead';
import FreeDeliveryProgress from '../components/FreeDeliveryProgress';
import { ButtonLoader } from '../components/Loaders';
import api from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Address form fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560001');

  // Delivery preferences
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('10:00 AM - 01:00 PM');

  // Gift options
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(localStorage.getItem('dhakshu_applied_coupon') || '');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Inject Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Validate stored coupon if present
    if (appliedCoupon && cart.subtotal > 0) {
      validateCoupon(appliedCoupon);
    }
  }, [cart.subtotal]);

  const validateCoupon = async (code) => {
    if (!code) return;
    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: code,
        orderSubtotal: cart.subtotal,
      });

      if (res.success && res.data.valid) {
        setCouponDiscount(res.data.calculatedDiscount);
      } else {
        setCouponDiscount(0);
        setAppliedCoupon('');
        localStorage.removeItem('dhakshu_applied_coupon');
      }
    } catch (e) {
      setCouponDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponDiscount(0);
    localStorage.removeItem('dhakshu_applied_coupon');
    showToast('Coupon removed', 'info');
  };

  const deliveryFee = cart.subtotal >= 499 || cart.subtotal === 0 ? 0 : 50;
  const finalTotal = Math.max(0, cart.subtotal - couponDiscount + deliveryFee);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!fullName || !phone || !addressLine1 || !city || !postalCode) {
      showToast('Please fill in all required shipping address fields', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        deliveryDate,
        deliveryTimeSlot,
        isGift,
        recipientName: isGift ? recipientName : null,
        giftMessage: isGift ? giftMessage : null,
        couponCode: appliedCoupon || null,
      };

      const res = await api.post('/orders', orderPayload);

      if (res.success && res.data) {
        const { order, razorpayOrder } = res.data;

        // Initialize Razorpay Checkout Modal
        const rzpData = razorpayOrder;

        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'Dhakshu Bakes',
          description: `Order #${order.orderNumber}`,
          order_id: rzpData.razorpayOrderId.startsWith('order_rzp_') ? undefined : rzpData.razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify-razorpay', {
                orderId: order.id,
                razorpayOrderId: rzpData.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id || 'pay_sample_' + Date.now(),
                razorpaySignature: response.razorpay_signature || 'sig_sample_' + Date.now(),
              });

              if (verifyRes.success) {
                clearCart();
                localStorage.removeItem('dhakshu_applied_coupon');
                showToast('Payment successful! Your order is being baked.', 'success');
                navigate(`/orders/${order.orderNumber}`);
              } else {
                showToast('Payment signature verification failed.', 'error');
              }
            } catch (e) {
              showToast(e.message || 'Error completing payment verification', 'error');
            }
          },
          prefill: {
            name: rzpData.customerName,
            email: rzpData.customerEmail,
            contact: rzpData.customerPhone,
          },
          theme: {
            color: '#8C5A3C',
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (resp) {
            showToast(resp.error.description || 'Payment process failed or cancelled', 'error');
          });
          rzp.open();
        } else {
          // Fallback simulation if Razorpay JS SDK fails to load
          clearCart();
          localStorage.removeItem('dhakshu_applied_coupon');
          showToast('Order created! (Razorpay SDK sandbox mode)', 'success');
          navigate(`/orders/${order.orderNumber}`);
        }
      } else {
        showToast(res.message || 'Failed to place order', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error placing order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-bakery-dark">No Items to Checkout</h2>
        <p className="text-xs text-gray-500">Your shopping cart is empty.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2 bg-bakery-dark text-white font-bold text-xs rounded-full"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SEOHead title="Checkout & Payment" noindex={true} />

      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-dark">CHECKOUT</h1>
        <p className="text-xs text-gray-500 mt-1">Provide your delivery address and schedule your fresh bake delivery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Delivery Form & Schedule */}
        <form id="checkout-form" onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-bakery-dark flex items-center gap-2">
              <Truck className="w-5 h-5 text-bakery-caramel" />
              <span>1. Shipping Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout_fullName" className="block text-xs font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  id="checkout_fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="checkout_phone" className="block text-xs font-bold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  id="checkout_phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="checkout_addressLine1" className="block text-xs font-bold text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label>
              <input
                id="checkout_addressLine1"
                type="text"
                required
                placeholder="House/Flat No., Building Name, Street"
                autoComplete="address-line1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="checkout_addressLine2" className="block text-xs font-bold text-gray-700 mb-1">Landmark / Area (Optional)</label>
              <input
                id="checkout_addressLine2"
                type="text"
                placeholder="Near Metro Station or Park"
                autoComplete="address-line2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout_city" className="block text-xs font-bold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input
                  id="checkout_city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="checkout_postalCode" className="block text-xs font-bold text-gray-700 mb-1">Postal PIN Code <span className="text-red-500">*</span></label>
                <input
                  id="checkout_postalCode"
                  type="text"
                  required
                  autoComplete="postal-code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Date & Time Slot */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-bakery-dark flex items-center gap-2">
              <Calendar className="w-5 h-5 text-bakery-caramel" />
              <span>2. Delivery Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout_deliveryDate" className="block text-xs font-bold text-gray-700 mb-1">Preferred Delivery Date</label>
                <input
                  id="checkout_deliveryDate"
                  type="date"
                  value={deliveryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="checkout_deliveryTimeSlot" className="block text-xs font-bold text-gray-700 mb-1">Select Time Slot</label>
                <select
                  id="checkout_deliveryTimeSlot"
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg font-medium"
                >
                  <option value="10:00 AM - 01:00 PM">Morning Slot (10:00 AM - 01:00 PM)</option>
                  <option value="02:00 PM - 05:00 PM">Afternoon Slot (02:00 PM - 05:00 PM)</option>
                  <option value="06:00 PM - 09:00 PM">Evening Slot (06:00 PM - 09:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Gift Packaging Options */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
            <label className="flex items-center gap-2 cursor-pointer font-serif font-bold text-base text-bakery-dark">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="rounded border-cream-300 text-bakery-caramel focus:ring-bakery-caramel"
              />
              <Gift className="w-5 h-5 text-bakery-rose" />
              <span>Send as a Gift Package</span>
            </label>

            {isGift && (
              <div className="space-y-3 pt-2 border-t border-cream-100 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Name of the person receiving the gift"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Custom Gift Message</label>
                  <textarea
                    rows={2}
                    placeholder="Wishing you a wonderful celebration! Warm wishes..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full p-2.5 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Right Sidebar: Authoritative Pricing & Payment Button */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs h-fit space-y-6">
          <h3 className="font-serif text-lg font-bold text-bakery-dark border-b border-cream-200 pb-3">Authoritative Total</h3>

          {/* Free Delivery Progress Banner */}
          <FreeDeliveryProgress subtotal={cart.subtotal} />

          {/* Active Coupon Status */}
          {appliedCoupon && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Coupon ({appliedCoupon}) Applied</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          )}

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span className="font-bold text-bakery-dark">₹{cart.subtotal}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount</span>
                <span>- ₹{couponDiscount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-bakery-dark">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="border-t border-cream-200 pt-3 flex justify-between text-lg font-extrabold text-bakery-dark">
              <span>Final Total Amount</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="w-full py-4 bg-bakery-caramel hover:bg-bakery text-white font-bold text-sm rounded-full shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? <ButtonLoader text="Initializing Payment..." /> : `Pay ₹${finalTotal} with Razorpay`}</span>
          </button>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay Official 256-Bit SSL Encryption</span>
            </div>
            <p className="text-[10px] text-gray-400">Supports Cards, UPI, NetBanking, & Wallets</p>
          </div>
        </div>

      </div>
    </div>
  );
}
