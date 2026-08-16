import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, CheckCircle, Calendar, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'BAKING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, TOMORROW
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await api.get('/admin/orders');
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.success && res.data) {
        setOrders(orders.map(o => o.id === orderId ? res.data : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === 'TODAY') return o.deliveryDate === todayStr;
    if (dateFilter === 'TOMORROW') return o.deliveryDate === tomorrowStr;
    return true;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bakery-dark">ADMIN ORDER FULFILLMENT</h1>
          <p className="text-xs text-gray-500 mt-1">Manage kitchen baking queue, delivery schedules, and custom instructions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-cream-300 rounded-lg font-bold text-bakery-dark"
            >
              <option value="ALL">All Delivery Dates</option>
              <option value="TODAY">Today's Deliveries ({orders.filter(o => o.deliveryDate === todayStr).length})</option>
              <option value="TOMORROW">Tomorrow's Deliveries ({orders.filter(o => o.deliveryDate === tomorrowStr).length})</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-white border border-cream-300 rounded-full w-60"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/60 text-bakery-dark uppercase font-bold text-[10px] tracking-wider whitespace-nowrap">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Delivery Date & Slot</th>
                <th className="p-3">Delivery Type</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Baking / Fulfillment Status</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredOrders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                return (
                  <React.Fragment key={o.id}>
                    <tr className="hover:bg-cream-50/50">
                      <td className="p-3 font-bold text-bakery-dark">{o.orderNumber}</td>
                      <td className="p-3">
                        <p className="font-bold text-bakery-dark">{o.customerName}</p>
                        <p className="text-[10px] text-gray-400">{o.customerEmail}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-bakery-dark">{o.deliveryDate || 'Standard'}</p>
                        <p className="text-[10px] text-gray-500">{o.deliveryTimeSlot || 'Morning (9 AM - 12 PM)'}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-bakery-caramel">
                        {o.deliveryType || 'STANDARD'}
                      </td>
                      <td className="p-3 font-extrabold text-bakery-dark">₹{o.totalAmount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="px-2 py-1 text-xs bg-cream-100 border border-cream-300 rounded-md font-bold text-bakery-dark"
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                          className="p-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-bakery-dark font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-cream-50/80">
                        <td colSpan={8} className="p-4 border-t border-cream-200 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <h4 className="font-serif font-bold text-bakery-dark mb-1 uppercase tracking-wider text-[10px]">Ordered Bake Items & Customizations</h4>
                              <div className="space-y-2">
                                {o.items?.map((item) => (
                                  <div key={item.id} className="p-2.5 bg-white rounded-xl border border-cream-200 space-y-1">
                                    <div className="flex justify-between items-center font-bold text-bakery-dark">
                                      <span>{item.productName} ({item.variantName}) × {item.quantity}</span>
                                      <span>₹{item.totalPrice}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {item.isEggless && <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">Eggless</span>}
                                      {item.isGiftWrapped && <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">Gift Wrapped</span>}
                                    </div>
                                    {item.customMessage && (
                                      <p className="text-[10px] text-gray-700 bg-cream-100 p-1 rounded font-medium">
                                        🎂 <strong>Message:</strong> "{item.customMessage}"
                                      </p>
                                    )}
                                    {item.specialInstructions && (
                                      <p className="text-[10px] text-gray-500 italic">
                                        📝 Instructions: {item.specialInstructions}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-serif font-bold text-bakery-dark mb-1 uppercase tracking-wider text-[10px]">Delivery & Address Notes</h4>
                              <div className="p-3 bg-white rounded-xl border border-cream-200 space-y-1 text-gray-700">
                                {o.shippingAddress && (
                                  <>
                                    <p className="font-bold text-bakery-dark">{o.shippingAddress.fullName} ({o.shippingAddress.phone})</p>
                                    <p>{o.shippingAddress.addressLine1}, {o.shippingAddress.city} - {o.shippingAddress.postalCode}</p>
                                  </>
                                )}
                                {o.deliveryInstructions && (
                                  <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 mt-2 font-medium">
                                    🚚 <strong>Driver Instructions:</strong> {o.deliveryInstructions}
                                  </p>
                                )}
                                {o.isGift && (
                                  <p className="text-[11px] text-rose-900 bg-rose-50 p-2 rounded border border-rose-200 mt-2 font-medium">
                                    🎁 <strong>Gift Package for:</strong> {o.recipientName} {o.giftMessage ? `("${o.giftMessage}")` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
