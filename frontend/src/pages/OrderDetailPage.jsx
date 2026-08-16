import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, Truck, Cake, Gift, ArrowLeft, PackageCheck, AlertCircle, Ban } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SEOHead from '../components/SEOHead';
import { ButtonLoader } from '../components/Loaders';
import api from '../services/api';

const STAGES = [
  { id: 'PENDING', label: 'Ordered', icon: Clock },
  { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'PROCESSING', label: 'Preparing Ingredients', icon: Cake },
  { id: 'BAKING', label: 'Baking Fresh', icon: Cake },
  { id: 'READY_FOR_PICKUP', label: 'Ready / Packaged', icon: PackageCheck },
  { id: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.success) setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await api.post(`/orders/${order.id}/cancel`);
      if (res.success && res.data) {
        setOrder(res.data);
        setShowCancelModal(false);
        showToast(`Order #${order.orderNumber} has been cancelled.`, 'info');
      }
    } catch (e) {
      showToast(e.message || 'Unable to cancel order at this stage', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-semibold text-gray-400">
        Loading order details & tracking status...
      </div>
    );
  }

  const getStageIndex = (status) => {
    const idx = STAGES.findIndex(s => s.id === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStageIdx = getStageIndex(order.orderStatus);
  const isCancellable = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <SEOHead title={order ? `Order #${order.orderNumber}` : 'Order Detail'} noindex={true} />
      
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-bakery-caramel hover:text-bakery">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <span className="text-xs font-bold text-bakery-caramel uppercase tracking-widest block">ORDER TRACKING</span>
          <h1 className="font-serif text-3xl font-extrabold text-bakery-dark">Order #{order.orderNumber}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
            order.paymentStatus === 'REFUND_PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
          }`}>
            Payment: {order.paymentStatus}
          </span>

          <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
            order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-bakery-gold/20 text-bakery-dark'
          }`}>
            Status: {order.orderStatus}
          </span>

          {isCancellable && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-full border border-red-200"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Honest Refund Processing Banner */}
      {order.paymentStatus === 'REFUND_PENDING' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Refund Processing (REFUND_PENDING)</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              This order was paid online prior to cancellation. Your refund has been recorded and is currently being processed by our billing team.
            </p>
          </div>
        </div>
      )}

      {/* Visual Timeline Bar */}
      {order.orderStatus !== 'CANCELLED' ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-base text-bakery-dark">Bakery Fulfillment Timeline</h3>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex flex-1 flex-col items-center text-center relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-bakery-caramel text-white border-bakery-caramel shadow-md'
                      : 'bg-cream-100 text-gray-400 border-cream-300'
                  } ${isCurrent ? 'ring-4 ring-bakery-gold/40 scale-110' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isCompleted ? 'text-bakery-dark' : 'text-gray-400'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-center space-y-2">
          <Ban className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-serif font-bold text-base text-red-900">This Order Was Cancelled</h3>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            Ingredients and inventory reserved for this order have been restored to our kitchen stock.
          </p>
        </div>
      )}

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-cream-200 space-y-4">
          <h3 className="font-serif font-bold text-base text-bakery-dark border-b border-cream-200 pb-3">Purchased Items</h3>
          
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-cream-100 last:border-0">
                <div>
                  <p className="font-bold text-xs text-bakery-dark">{item.productName}</p>
                  <p className="text-[11px] text-bakery-caramel">{item.variantName} × {item.quantity}</p>
                </div>
                <span className="font-extrabold text-xs text-bakery-dark">₹{item.totalPrice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 space-y-6 h-fit">
          <h3 className="font-serif font-bold text-base text-bakery-dark border-b border-cream-200 pb-3">Delivery Information</h3>

          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-bold text-bakery-dark">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
            <p className="font-semibold text-bakery-caramel mt-1">Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="text-xs text-gray-600 space-y-1 border-t border-cream-200 pt-3">
            <p><strong>Delivery Date:</strong> {order.deliveryDate || 'Standard Delivery'}</p>
            <p><strong>Time Window:</strong> {order.deliveryTimeSlot || '10:00 AM - 01:00 PM'}</p>
          </div>

          {order.isGift && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs space-y-1">
              <div className="flex items-center gap-1 text-bakery-rose font-bold">
                <Gift className="w-4 h-4" /> Gift Order for {order.recipientName}
              </div>
              <p className="italic text-gray-600">"{order.giftMessage}"</p>
            </div>
          )}

        </div>

      </div>

      {/* Cancel Order Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title={`Cancel Order #${order.orderNumber}?`}
        message="Are you sure you want to cancel this bakery order? This action will restore reserved ingredients to our stock."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
}
