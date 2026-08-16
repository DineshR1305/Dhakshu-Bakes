import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Calendar, Clock, Gift, CreditCard, Lock, CheckCircle, Tag, Trash2, MapPin, Sparkles, AlertCircle } from 'lucide-react';
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
  const [city, setCity] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('641001');

  // Delivery Serviceability & Type
  const [serviceability, setServiceability] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryType, setDeliveryType] = useState('STANDARD'); // STANDARD, EXPRESS, SAME_DAY
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Delivery Schedule & Slots
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    // Validate stored coupon if present
    if (appliedCoupon && cart.subtotal > 0) {
      validateCoupon(appliedCoupon);
    }

    // Load saved user addresses
    if (user) {
      loadSavedAddresses();
    }
  }, [cart.subtotal, user]);

  useEffect(() => {
    if (deliveryDate) {
      fetchDeliverySlots(deliveryDate);
    }
  }, [deliveryDate]);

  useEffect(() => {
    if (postalCode && postalCode.trim().length >= 6) {
      checkPincodeServiceability(postalCode.trim(), deliveryType);
    }
  }, [postalCode, cart.subtotal, deliveryType]);

  const loadSavedAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAddresses(res.data);
        const def = res.data.find(a => a.isDefault) || res.data[0];
        if (def) {
          applySavedAddress(def);
        }
      }
    } catch (e) {
      console.error('Error loading saved addresses:', e);
    }
  };

  const applySavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
  };

  const fetchDeliverySlots = async (dateStr) => {
    setLoadingSlots(true);
    try {
      const res = await api.get(`/delivery/slots?date=${dateStr}`);
      if (res.success && Array.isArray(res.data)) {
        setSlots(res.data);
        const available = res.data.find(s => s.available);
        if (available) {
          setSelectedSlotId(available.id);
          setDeliveryTimeSlot(available.slotName);
        } else {
          setSelectedSlotId(null);
          setDeliveryTimeSlot('');
        }
      }
    } catch (e) {
      console.error('Error loading delivery slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const checkPincodeServiceability = async (code, type) => {
    setCheckingPincode(true);
    try {
      const res = await api.post('/delivery/check-serviceability', {
        pincode: code,
        subtotal: cart.subtotal,
        deliveryType: type,
      });
      if (res.success && res.data) {
        setServiceability(res.data);
      }
    } catch (e) {
      console.error('Error checking serviceability:', e);
    } finally {
      setCheckingPincode(false);
    }
  };

  const validateCoupon = async (code) => {
    if (!code) return;
    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: code,
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
    } finally {
      setValidatingCoupon(false);
    }
  };

  const calculatedDeliveryFee = serviceability?.deliveryFee != null ? serviceability.deliveryFee : (cart.subtotal >= 499 ? 0 : 50);
  const finalTotal = Math.max(0, cart.subtotal - couponDiscount + calculatedDeliveryFee);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!fullName || !phone || !addressLine1 || !city || !postalCode) {
      showToast('Please fill in all required shipping address fields', 'warning');
      return;
    }

    if (serviceability && !serviceability.serviceable) {
      showToast(`Delivery is not available to pincode ${postalCode}`, 'error');
      return;
    }

    if (!deliveryTimeSlot && slots.length > 0) {
      showToast('Please select an available delivery slot', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        shippingAddressId: selectedAddressId,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        deliveryDate,
        deliveryTimeSlot,
        deliverySlotId: selectedSlotId,
        deliveryType,
        deliveryInstructions,
        isGift,
        recipientName: isGift ? recipientName : null,
        giftMessage: isGift ? giftMessage : null,
        couponCode: appliedCoupon || null,
      };

      const res = await api.post('/orders/checkout', orderPayload);

      if (res.success && res.data) {
        const order = res.data;
        clearCart();
        localStorage.removeItem('dhakshu_applied_coupon');
        showToast('Order created successfully!', 'success');
        navigate(`/orders/${order.orderNumber}`);
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
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-bakery-dark flex items-center gap-2">
                <Truck className="w-5 h-5 text-bakery-caramel" />
                <span>1. Shipping Address</span>
              </h3>
            </div>

            {/* Saved Address Selector */}
            {addresses.length > 0 && (
              <div className="space-y-2 pt-1 border-b border-cream-200 pb-4">
                <label className="block text-xs font-bold text-gray-700">Select Saved Address:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applySavedAddress(addr)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-bakery-caramel bg-cream-100/70 font-bold text-bakery-dark shadow-2xs'
                          : 'border-cream-300 bg-white text-gray-600 hover:border-cream-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{addr.fullName}</span>
                        {addr.isDefault && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="truncate text-gray-500 text-[11px] mt-0.5">{addr.addressLine1}, {addr.city}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* Pincode Serviceability Status Badge */}
            {serviceability && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                serviceability.serviceable ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{serviceability.message}</span>
              </div>
            )}
          </div>

          {/* Step 2: Delivery Schedule & Slots */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-bakery-dark flex items-center gap-2">
              <Calendar className="w-5 h-5 text-bakery-caramel" />
              <span>2. Delivery Schedule & Time Slot</span>
            </h3>

            {/* Delivery Type Option Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeliveryType('STANDARD')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  deliveryType === 'STANDARD'
                    ? 'border-bakery-caramel bg-cream-100/70 font-bold text-bakery-dark shadow-2xs'
                    : 'border-cream-300 bg-white text-gray-600 hover:border-cream-400'
                }`}
              >
                <span className="font-extrabold block text-bakery-dark">Standard Delivery</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">Free over ₹499 (else ₹50)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('EXPRESS')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  deliveryType === 'EXPRESS'
                    ? 'border-bakery-caramel bg-cream-100/70 font-bold text-bakery-dark shadow-2xs'
                    : 'border-cream-300 bg-white text-gray-600 hover:border-cream-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold block text-bakery-dark">Express Delivery</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">+₹40</span>
                </div>
                <span className="text-[11px] text-gray-500 block mt-0.5">Priority dispatch window</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('SAME_DAY')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  deliveryType === 'SAME_DAY'
                    ? 'border-bakery-caramel bg-cream-100/70 font-bold text-bakery-dark shadow-2xs'
                    : 'border-cream-300 bg-white text-gray-600 hover:border-cream-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold block text-bakery-dark">Same-Day Fresh</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">+₹60</span>
                </div>
                <span className="text-[11px] text-gray-500 block mt-0.5">Baked & delivered today</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="checkout_deliveryDate" className="block text-xs font-bold text-gray-700 mb-1">Preferred Delivery Date</label>
                <input
                  id="checkout_deliveryDate"
                  type="date"
                  value={deliveryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Available Time Slots</label>
                {loadingSlots ? (
                  <p className="text-xs text-gray-400 py-2">Loading slots...</p>
                ) : slots.length === 0 ? (
                  <p className="text-xs text-red-500 italic py-2">No slots available for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!s.available}
                        onClick={() => {
                          setSelectedSlotId(s.id);
                          setDeliveryTimeSlot(s.slotName);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          selectedSlotId === s.id
                            ? 'border-bakery-caramel bg-cream-100/80 font-bold text-bakery-dark shadow-2xs'
                            : s.available
                            ? 'border-cream-300 bg-white text-gray-700 hover:border-cream-400'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-bakery-caramel shrink-0" />
                          <span className="font-bold">{s.slotName}</span>
                        </div>
                        <span className="text-[10px] font-semibold">
                          {s.available ? `${s.remainingCapacity} slots left` : 'Fully booked'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="pt-2 border-t border-cream-100">
              <label htmlFor="checkout_deliveryInstructions" className="block text-xs font-bold text-gray-700 mb-1">
                Driver Delivery Instructions <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="checkout_deliveryInstructions"
                type="text"
                placeholder="e.g. Ring bell twice / leave with security guard..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
              />
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
              <div className="space-y-3 pt-2 border-t border-cream-100 animate-fadeIn text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Name of the person receiving the gift"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Custom Gift Message</label>
                  <textarea
                    rows={2}
                    placeholder="Message to write on gift card..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Right Sidebar: Order Summary & Place Order */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-6 sticky top-24">
            <h3 className="font-serif text-lg font-bold text-bakery-dark border-b border-cream-200 pb-3">Order Summary</h3>

            {/* Cart Items Preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 border-b border-cream-200 pb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-bakery-dark block truncate">{item.productName}</span>
                    <span className="text-[11px] text-gray-500 block">
                      {item.variantName} × {item.quantity}
                    </span>
                    {item.customMessage && (
                      <span className="text-[10px] text-bakery-caramel block italic truncate">
                        "{item.customMessage}"
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-bakery-dark shrink-0">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-bakery-dark">₹{cart.subtotal}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee ({deliveryType})</span>
                <span className="font-bold text-bakery-dark">
                  {calculatedDeliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${calculatedDeliveryFee}`}
                </span>
              </div>

              <div className="border-t border-cream-200 pt-3 flex justify-between text-base font-extrabold text-bakery-dark">
                <span>Total Amount</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Place Order Action Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || (serviceability && !serviceability.serviceable)}
              className="w-full py-4 bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:bg-gray-400 cursor-pointer"
            >
              {submitting ? (
                <ButtonLoader text="Processing Order..." />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order (₹{finalTotal})</span>
                </>
              )}
            </button>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Fresh Bake & Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
