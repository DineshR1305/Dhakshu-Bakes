import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success) setMetrics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-sm font-semibold text-gray-400">
        Loading administrative analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-bakery-dark">ADMINISTRATIVE DASHBOARD</h1>
        <p className="text-xs text-gray-500 mt-1">Real-time bakery performance, sales metrics, and fulfillment hub.</p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Sales Revenue</span>
            <span className="text-2xl font-extrabold text-bakery-dark mt-1 block">₹{metrics.totalSales}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Today: ₹{metrics.todaySales}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-extrabold text-bakery-dark mt-1 block">{metrics.totalOrders}</span>
            <span className="text-[11px] text-amber-600 font-semibold">{metrics.pendingOrders} Pending Fulfillment</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Registered Customers</span>
            <span className="text-2xl font-extrabold text-bakery-dark mt-1 block">{metrics.totalCustomers}</span>
            <span className="text-[11px] text-bakery-caramel font-semibold">Active Patron Base</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cream-200 text-bakery-dark flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="text-2xl font-extrabold text-bakery-dark mt-1 block">{metrics.lowStockCount}</span>
            <span className="text-[11px] text-red-600 font-semibold">Requires Replenishment</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Revenue Performance Chart Bar Simulation */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-bakery-dark flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-bakery-caramel" />
            <span>Weekly Sales Revenue Trend</span>
          </h3>
          <span className="text-xs text-gray-400">Past 7 Days</span>
        </div>

        <div className="grid grid-cols-7 gap-4 items-end h-40 pt-6">
          {metrics.revenueChart?.map((dp, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
              <div
                className="w-full bg-bakery-caramel/80 hover:bg-bakery rounded-t-lg transition-all relative group"
                style={{ height: `${Math.min(100, (dp.revenue / 5000) * 100)}%` }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{dp.revenue}
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-500">{dp.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <h3 className="font-serif font-bold text-base text-bakery-dark">Recent Customer Orders</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-bakery-caramel hover:text-bakery flex items-center gap-1">
            View All Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/60 text-bakery-dark uppercase font-bold text-[10px] tracking-wider whitespace-nowrap">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 whitespace-nowrap">
              {metrics.recentOrders?.map((o) => (
                <tr key={o.id} className="hover:bg-cream-50">
                  <td className="p-3 font-bold text-bakery-dark">{o.orderNumber}</td>
                  <td className="p-3 text-gray-700">{o.customerName}</td>
                  <td className="p-3 font-extrabold text-bakery-dark">₹{o.totalAmount}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {o.orderStatus}
                    </span>
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
