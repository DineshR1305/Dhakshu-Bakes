import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check } from 'lucide-react';
import api from '../services/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('300');

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      const res = await api.get('/admin/coupons');
      if (res.success) setCoupons(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/coupons', {
        code, discountType, discountValue: Number(discountValue), minOrderAmount: Number(minOrderAmount), isActive: true
      });
      if (res.success) {
        setCode('');
        setDiscountValue('');
        loadCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">COUPON & PROMOTION MANAGEMENT</h1>
        <p className="text-xs text-gray-500">Create percentage or fixed discount promotional vouchers.</p>
      </div>

      {/* Add Coupon Form */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4 max-w-xl">
        <h3 className="font-serif font-bold text-sm text-bakery-dark">Create New Coupon Voucher</h3>
        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="e.g. DHAKSHU100"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg uppercase font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg font-bold"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Discount Value</label>
              <input
                type="number"
                required
                placeholder="10 or 100"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg font-bold"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-bakery-dark text-white font-bold rounded-full hover:bg-bakery flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100/60 text-bakery-dark uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-bold text-bakery-dark">{c.code}</td>
                <td className="p-3">{c.discountType}</td>
                <td className="p-3 font-bold text-emerald-700">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td className="p-3">₹{c.minOrderAmount}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
