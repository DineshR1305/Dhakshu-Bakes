import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, CheckCircle2, Truck, Gift, RefreshCw, Printer, AlertTriangle, XCircle, ShieldCheck, MapPin, ChevronLeft, Calendar } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SEOHead from '../components/SEOHead';
import OrderReceiptModal from '../components/OrderReceiptModal';
import { PageLoader } from '../components/Loaders';
import NotFoundPage from './NotFoundPage';
import api from '../services/api';

export default function OrderDetailPage() {
  const { id: orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [reordering, setReordering] = useState(false);

  const { addToCart, openDrawer } = useCartStore();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setNotFound(false);
      try {
        const res = await api.get(`/orders/${orderNumber}`);
        if (res && res.success && res.data) {
          setOrder(res.data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return <PageLoader text="Loading order details..." />;
  }

  if (notFound || !order) {
    return <NotFoundPage />;
  }

  const isCancellable = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';
  const isCancelled = order.orderStatus === 'CANCELLED';

  const handleCancelOrder = async () => {
    if (!order || !isCancellable) return;
    setCancelling(true);
    try {
      const res = await api.post(`/orders/${order.id}/cancel`);
      if (res && res.success && res.data) {
        setOrder(res.data);
        showToast('Order cancelled successfully. Inventory & coupons restored.', 'info');
      } else {
        showToast(res.message || 'Could not cancel order', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error cancelling order', 'error');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleReorder = async () => {
    if (!order.items || order.items.length === 0) return;
    setReordering(true);

    let successCount = 0;
    for (const item of order.items) {
      if (item.productId && item.variantId) {
        const res = await addToCart(item.productId, item.variantId, item.quantity);
        if (res && res.success) successCount++;
      }
    }

    setReordering(false);
    if (successCount > 0) {
      showToast(`Added ${successCount} item(s) to cart!`, 'success');
      openDrawer();
    } else {
      showToast('Items from this order are currently out of stock', 'warning');
    }
  };

  // Order status steps definition
  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Received by bakery' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Ingredients prepared' },
    { key: 'PROCESSING', label: 'Baking Fresh', desc: 'Oven baking in progress' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Driver dispatched' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Enjoy your bakes!' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING':
      case 'BAKING': return 2;
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SEOHead title={`Order #${order.orderNumber}`} noindex={true} />

      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-bakery-caramel hover:text-bakery transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
        <button
          onClick={() => setShowReceiptModal(true)}
          className="px-4 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-bakery-dark text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-bakery-caramel uppercase tracking-wider block">Order Details</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-bakery-dark">#{order.orderNumber}</h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
            isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            Status: {order.orderStatus}
          </span>
          <span className="text-xs text-gray-500 font-semibold">
            Payment: <strong className="text-bakery-dark">{order.paymentStatus}</strong>
          </span>
        </div>
      </div>

      {/* Order Status Timeline / Cancellation Box */}
      {isCancelled ? (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Order Cancelled</span>
          </div>
          <p className="text-rose-700 leading-relaxed">
            This order was cancelled. Reserved inventory stock and any applied coupon usages have been restored.
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-bakery-dark">Order Status Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {statusSteps.map((step, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step.key} className="flex flex-col items-start sm:items-center text-left sm:text-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted ? 'bg-emerald-600 text-white shadow-xs' : 'bg-cream-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isCompleted ? 'text-bakery-dark' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight hidden sm:block mt-0.5">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Product Items Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-bakery-dark border-b border-cream-200 pb-3">Ordered Items ({order.items?.length || 0})</h3>

            <div className="space-y-4">
              {order.items && order.items.map((item) => (
                <div key={item.id} className="p-3.5 bg-cream-50/60 rounded-2xl border border-cream-200 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cream-100 border border-cream-200 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-bakery-caramel" />
                    </div>
                    <div>
                      <Link to={`/product/${item.productSlug}`} className="font-serif font-bold text-bakery-dark hover:text-bakery text-sm block">
                        {item.productName}
                      </Link>
                      <p className="text-[11px] text-bakery-caramel font-semibold">{item.variantName}</p>
                      <p className="text-gray-500 mt-0.5">₹{item.unitPrice} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-bakery-dark">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Schedule Info */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-bakery-dark border-b border-cream-200 pb-3">Delivery Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1 text-[10px]">Shipping Address</span>
                {order.shippingAddress ? (
                  <div className="space-y-0.5 text-gray-700">
                    <p className="font-bold text-bakery-dark">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                    <p className="text-bakery-caramel font-semibold">Phone: {order.shippingAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Standard Bakery Address</p>
                )}
              </div>

              <div>
                <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1 text-[10px]">Schedule & Preferences</span>
                <p className="font-semibold text-bakery-dark">Date: {order.deliveryDate || 'Standard Delivery'}</p>
                <p className="text-gray-600">Slot: {order.deliveryTimeSlot || '10:00 AM - 01:00 PM'}</p>
                {order.isGift && (
                  <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                    <p className="font-bold">🎁 Gift Package for: {order.recipientName}</p>
                    {order.giftMessage && <p className="italic text-[11px]">"{order.giftMessage}"</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Cost Summary & Actions */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs h-fit space-y-6">
          <h3 className="font-serif text-lg font-bold text-bakery-dark border-b border-cream-200 pb-3">Payment Summary</h3>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-bakery-dark">₹{order.subtotal}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({order.appliedCouponCode})</span>
                <span>- ₹{order.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-bold text-bakery-dark">
                {order.deliveryFee == 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.deliveryFee}`}
              </span>
            </div>

            {order.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Tax / GST</span>
                <span className="font-bold text-bakery-dark">₹{order.taxAmount}</span>
              </div>
            )}

            <div className="border-t border-cream-200 pt-3 flex justify-between text-lg font-extrabold text-bakery-dark">
              <span>Grand Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleReorder}
              disabled={reordering}
              className="w-full py-3 bg-cream-200 hover:bg-bakery-caramel text-bakery-dark hover:text-white font-bold text-xs rounded-full shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${reordering ? 'animate-spin' : ''}`} />
              <span>Buy Again</span>
            </button>

            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-full border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2 border-t border-cream-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FSSAI Certified Fresh Bakery Guarantee</span>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Order Cancellation */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Bakery Order?"
        message={`Are you sure you want to cancel Order #${order.orderNumber}? Reserved stock items and coupon usages will be automatically restored.`}
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        isDanger={true}
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Order Receipt Modal */}
      <OrderReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        order={order}
      />
    </div>
  );
}
