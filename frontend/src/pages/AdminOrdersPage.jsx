import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'BAKING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await api.get('/admin/orders');
      if (res.success) setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        setOrders(orders.map(o => o.id === orderId ? res.data : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bakery-dark">ADMIN ORDER FULFILLMENT</h1>
          <p className="text-xs text-gray-500">Manage real-time order status updates and kitchen workflow.</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-white border border-cream-300 rounded-full w-64"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/60 text-bakery-dark uppercase font-bold text-[10px] tracking-wider whitespace-nowrap">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Items</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Baking / Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 whitespace-nowrap">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-cream-50">
                  <td className="p-3 font-bold text-bakery-dark">{o.orderNumber}</td>
                  <td className="p-3">
                    <p className="font-bold text-bakery-dark">{o.customerName}</p>
                    <p className="text-[10px] text-gray-400">{o.customerEmail}</p>
                  </td>
                  <td className="p-3 font-extrabold text-bakery-dark">₹{o.totalAmount}</td>
                  <td className="p-3 text-gray-600">{o.items?.length || 0} items</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
