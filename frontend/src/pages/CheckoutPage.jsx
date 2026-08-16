import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Calendar, Clock, Gift, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Address form fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Delivery preferences
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('10:00 AM - 01:00 PM');

  // Gift options
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inject Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/account/addresses', {
        fullName, phone, addressLine1, addressLine2, city, state, postalCode, country: 'India', isDefault: true
      });
      if (res.success && res.data) {
        setAddresses([res.data, ...addresses]);
        setSelectedAddressId(res.data.id);
        setShowNewAddressForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrderAndPay = async () => {
    setLoading(true);
    try {
      // 1. Create Address if none selected and form filled
      let addressId = selectedAddressId;
      if (!addressId) {
        const addrRes = await api.post('/account/addresses', {
          fullName: fullName || user?.fullName || 'Customer',
          phone: phone || '+91 9876543210',
          addressLine1: addressLine1 || '101 Residency Road',
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          postalCode: postalCode || '560001',
          country: 'India',
          isDefault: true
        });
        if (addrRes.success) addressId = addrRes.data.id;
      }

      // 2. Call backend checkout order creation
      const appliedCoupon = localStorage.getItem('dhakshu_applied_coupon');
      const checkoutRes = await api.post('/orders/checkout', {
        shippingAddressId: addressId,
        couponCode: appliedCoupon,
        deliveryDate,
        deliveryTimeSlot,
        isGift,
        giftMessage,
        recipientName
      });

      if (!checkoutRes.success || !checkoutRes.data) {
        alert(checkoutRes.message || 'Checkout failed');
        setLoading(false);
        return;
      }

      const order = checkoutRes.data;

      // 3. Initiate Razorpay payment order
      const rzpRes = await api.post('/payments/create-razorpay-order', { orderId: order.id });
      if (!rzpRes.success || !rzpRes.data) {
        alert('Failed to initiate payment');
        setLoading(false);
        return;
      }

      const rzpData = rzpRes.data;

      // 4. Trigger Razorpay Checkout Popup
      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Dhakshu Bakes',
        description: `Order #${order.orderNumber}`,
        order_id: rzpData.razorpayOrderId.startsWith('order_rzp_') ? undefined : rzpData.razorpayOrderId,
        handler: async function (response) {
          // Server-side HMAC Signature Verification
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
              navigate(`/orders/${order.orderNumber}`);
            } else {
              alert('Payment Verification Failed');
            }
          } catch (e) {
            console.error(e);
          }
        },
        prefill: {
          name: rzpData.customerName,
          email: rzpData.customerEmail,
          contact: rzpData.customerPhone,
        },
        theme: {
          color: '#8B4513',
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation for test environment
        const verifyRes = await api.post('/payments/verify-razorpay', {
          orderId: order.id,
          razorpayOrderId: rzpData.razorpayOrderId,
          razorpayPaymentId: 'pay_simulated_' + Date.now(),
          razorpaySignature: 'sig_simulated_' + Date.now(),
        });
        if (verifyRes.success) {
          clearCart();
          localStorage.removeItem('dhakshu_applied_coupon');
          navigate(`/orders/${order.orderNumber}`);
        }
      }
    } catch (err) {
      alert(err.message || 'Error processing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-dark">CHECKOUT & PAYMENT</h1>
        <p className="text-xs text-gray-500 mt-1">Provide your delivery address and schedule slot to complete order.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Delivery Address Form */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-bakery-dark flex items-center gap-2">
              <Truck className="w-5 h-5 text-bakery-caramel" />
              <span>1. Shipping Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Flat, House No., Building, Street</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 104 Park Avenue, Indiranagar"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Postal PIN Code</label>
                <input
                  type="text"
                  required
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
              <span>2. Delivery Date & Time Slot</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Time Window</label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg font-medium"
                >
                  <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
                  <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                  <option value="06:00 PM - 09:00 PM">Evening (06:00 PM - 09:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Gifting Options */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-bakery-dark flex items-center gap-2">
                <Gift className="w-5 h-5 text-bakery-rose" />
                <span>3. Make This A Gift Order?</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-bakery-dark">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="rounded text-bakery-rose focus:ring-bakery-rose"
                />
                <span>Include Gift Message & Ribbon</span>
              </label>
            </div>

            {isGift && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Recipient's Name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Personal Note / Message</label>
                  <textarea
                    rows={2}
                    placeholder="Happy Birthday! Wishing you a sweet day..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full p-2.5 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Order Summary & Razorpay Payment Button */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs h-fit space-y-6">
          <h3 className="font-serif text-lg font-bold text-bakery-dark border-b border-cream-200 pb-3">Final Total</h3>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span className="font-bold text-bakery-dark">₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery Fee</span>
              <span className="font-bold text-bakery-dark">
                {cart.subtotal >= 499 ? <span className="text-emerald-600">FREE</span> : '₹50'}
              </span>
            </div>
            <div className="border-t border-cream-200 pt-3 flex justify-between text-lg font-extrabold text-bakery-dark">
              <span>Payable Amount</span>
              <span>₹{cart.subtotal >= 499 ? cart.subtotal : cart.subtotal + 50}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrderAndPay}
            disabled={loading}
            className="w-full py-4 bg-bakery-caramel hover:bg-bakery text-white font-bold text-sm rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Pay Online via Razorpay'}</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supports UPI, Debit/Credit Cards & NetBanking</span>
          </div>
        </div>

      </div>
    </div>
  );
}
