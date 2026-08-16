import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, Trash2, Power, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('300');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      const res = await api.get('/admin/coupons');
      if (res.success && Array.isArray(res.data)) setCoupons(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        expiryDate: expiryDate || null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: true,
      };

      const res = await api.post('/admin/coupons', payload);
      if (res.success) {
        setCode('');
        setDiscountValue('');
        setMaxDiscountAmount('');
        setExpiryDate('');
        setUsageLimit('');
        showToast('New promotion coupon created!', 'success');
        loadCoupons();
      }
    } catch (e) {
      showToast(e.message || 'Error creating coupon', 'error');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const updated = { ...coupon, active: !coupon.active };
      const res = await api.put(`/admin/coupons/${coupon.id}`, updated);
      if (res.success) {
        showToast(`Coupon ${coupon.code} status updated`, 'info');
        loadCoupons();
      }
    } catch (e) {
      showToast(e.message || 'Error updating status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      showToast('Coupon deleted', 'info');
      loadCoupons();
    } catch (e) {
      showToast(e.message || 'Error deleting coupon', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">COUPON & PROMOTION MANAGEMENT</h1>
        <p className="text-xs text-gray-500">Configure promotional discount codes, caps, minimum orders, and expiry limits.</p>
      </div>

      {/* Add Coupon Form */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4 max-w-2xl">
        <h3 className="font-serif font-bold text-sm text-bakery-dark">Create New Coupon Voucher</h3>
        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. DHAKSHU100"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg uppercase font-bold"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Discount Value *</label>
              <input
                type="number"
                required
                placeholder="10 or 100"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                placeholder="300"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Max Discount Cap (₹)</label>
              <input
                type="number"
                placeholder="Unlimited if empty"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Max Usage Limit</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-bakery-dark text-white font-bold rounded-full hover:bg-bakery flex items-center gap-1 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/60 text-bakery-dark uppercase font-bold text-[10px] tracking-wider whitespace-nowrap">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Min Order</th>
                <th className="p-3">Max Cap</th>
                <th className="p-3">Usage</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 whitespace-nowrap">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50/50">
                  <td className="p-3 font-bold text-bakery-dark">{c.code}</td>
                  <td className="p-3 font-bold text-emerald-700">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="p-3">₹{c.minOrderAmount || 0}</td>
                  <td className="p-3">{c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No cap'}</td>
                  <td className="p-3">{c.usedCount || 0} / {c.usageLimit || '∞'}</td>
                  <td className="p-3">{c.expiryDate || 'Never'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`p-1 rounded hover:bg-cream-100 ${c.active ? 'text-amber-600' : 'text-emerald-600'}`}
                        title={c.active ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Coupon Code?"
        message={`Are you sure you want to remove coupon ${deleteTarget?.code}?`}
        confirmText="Delete Coupon"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
