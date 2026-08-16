import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, CheckCircle2, RefreshCw, Printer, AlertCircle, ChevronRight, XCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../context/ToastContext';
import SEOHead from '../components/SEOHead';
import OrderReceiptModal from '../components/OrderReceiptModal';
import api from '../services/api';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);

  const { addToCart, openDrawer } = useCartStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const res = await api.get('/orders/my-orders');
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleReorder = async (order) => {
    if (!order.items || order.items.length === 0) return;
    setReorderingId(order.id);

    let successCount = 0;
    let outOfStockCount = 0;

    for (const item of order.items) {
      if (item.productId && item.variantId) {
        const res = await addToCart(item.productId, item.variantId, item.quantity);
        if (res && res.success) {
          successCount++;
        } else {
          outOfStockCount++;
        }
      }
    }

    setReorderingId(null);

    if (successCount > 0) {
      showToast(`Added ${successCount} item(s) from Order #${order.orderNumber} to cart!`, 'success');
      openDrawer();
    } else if (outOfStockCount > 0) {
      showToast('Items from this order are currently out of stock', 'warning');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 animate-pulse">Out for Delivery</span>;
      case 'PROCESSING':
      case 'BAKING':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">Baking Fresh</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">Confirmed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cream-200 text-bakery-dark text-xs font-bold">Pending</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SEOHead title="My Orders & Order History" noindex={true} />

      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bakery-dark">MY ORDERS</h1>
        <p className="text-xs text-gray-500 mt-1">Track live order status, view receipts, and quickly reorder past bakes.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Clock className="w-8 h-8 text-bakery-caramel animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-400">Loading your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-cream-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto text-bakery-caramel">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-bakery-dark">No Orders Found</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">You haven't placed any handcrafted bakery orders with us yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full transition-colors shadow-md"
          >
            <span>Explore Fresh Bakery Shop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-cream-200 shadow-xs hover:border-cream-300 transition-all overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-cream-50/80 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-bakery-dark">#{order.orderNumber}</span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-extrabold text-bakery-dark block">₹{order.totalAmount}</span>
                  <span className="text-[11px] text-gray-500 font-semibold">{order.items?.length || 0} items</span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-4 sm:p-5 space-y-3">
                {order.items && order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cream-100 border border-cream-200 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-bakery-caramel" />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-bakery-dark">{item.productName}</p>
                        <p className="text-[11px] text-bakery-caramel font-semibold">{item.variantName} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-bakery-dark">₹{item.totalPrice}</span>
                  </div>
                ))}

                {order.items && order.items.length > 3 && (
                  <p className="text-[11px] text-gray-400 font-semibold italic pt-1">
                    + {order.items.length - 3} more items in this order
                  </p>
                )}
              </div>

              {/* Order Card Footer Actions */}
              <div className="p-4 sm:p-5 bg-cream-50/40 border-t border-cream-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReceiptOrder(order)}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-cream-300 text-bakery-dark hover:bg-cream-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-500" />
                    <span>Receipt</span>
                  </button>

                  <button
                    onClick={() => handleReorder(order)}
                    disabled={reorderingId === order.id}
                    className="px-4 py-1.5 rounded-full bg-cream-200 hover:bg-bakery-caramel text-bakery-dark hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reorderingId === order.id ? 'animate-spin' : ''}`} />
                    <span>Buy Again</span>
                  </button>
                </div>

                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-bakery-caramel hover:text-bakery transition-colors"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Receipt Modal */}
      <OrderReceiptModal
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder}
      />
    </div>
  );
}
