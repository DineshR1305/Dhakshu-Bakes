import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import api from '../services/api';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.success) setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-semibold text-gray-400">
        Loading your order history...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEOHead title="Order History" noindex={true} />
      <div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">MY ORDERS</h1>
        <p className="text-xs text-gray-500 mt-1">Track current baking progress & view past purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-cream-200 text-center space-y-3">
          <Package className="w-12 h-12 text-cream-300 mx-auto" />
          <p className="text-sm font-bold text-bakery-dark">You have no orders yet.</p>
          <Link to="/shop" className="inline-block px-6 py-2 bg-bakery-dark text-white text-xs font-bold rounded-full">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-extrabold text-bakery-caramel">{o.orderNumber}</span>
                <p className="text-sm font-bold text-bakery-dark">₹{o.totalAmount} • {o.items?.length || 0} Items</p>
                <p className="text-xs text-gray-400">Placed on {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  o.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {o.orderStatus}
                </span>

                <Link
                  to={`/orders/${o.orderNumber}`}
                  className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-bakery-dark font-bold text-xs rounded-full flex items-center gap-1"
                >
                  <span>Track Order</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
