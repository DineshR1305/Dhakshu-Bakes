import React, { useState, useEffect } from 'react';
import { Tag, CheckCircle2, XCircle, Trash2, Gift, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ButtonLoader } from './Loaders';
import api from '../services/api';

export default function CouponSection({ subtotal, onCouponApplied, onCouponRemoved, appliedCoupon, appliedDiscount }) {
  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [showOffers, setShowOffers] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadActiveCoupons();
  }, []);

  const loadActiveCoupons = async () => {
    try {
      const res = await api.get('/coupons/active');
      if (res.success && Array.isArray(res.data)) {
        setActiveCoupons(res.data);
      }
    } catch (e) {
      console.error('Error loading active coupons:', e);
    }
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      showToast('Please enter a coupon code', 'warning');
      return;
    }

    setValidating(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: code,
        orderSubtotal: subtotal,
      });

      if (res.success && res.data && res.data.valid) {
        const discount = res.data.calculatedDiscount;
        localStorage.setItem('dhakshu_applied_coupon', code);
        if (onCouponApplied) onCouponApplied(code, discount);
        showToast(res.data.message || `Coupon ${code} applied successfully!`, 'success');
        setCouponCode('');
      } else {
        showToast(res.data?.message || res.message || 'Invalid coupon code', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to validate coupon', 'error');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    localStorage.removeItem('dhakshu_applied_coupon');
    if (onCouponRemoved) onCouponRemoved();
    showToast('Coupon code removed', 'info');
  };

  return (
    <div className="bg-cream-50/80 p-4 sm:p-5 rounded-2xl border border-cream-200 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-serif font-bold text-sm text-bakery-dark flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-bakery-caramel" />
          <span>Apply Promo / Coupon Code</span>
        </h4>

        {activeCoupons.length > 0 && (
          <button
            type="button"
            onClick={() => setShowOffers(!showOffers)}
            className="text-[11px] font-bold text-bakery-caramel hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{showOffers ? 'Hide Offers' : `${activeCoupons.length} Offers Available`}</span>
            {showOffers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Coupon Code: {appliedCoupon}</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              🎉 You saved ₹{appliedDiscount} on this order!
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-full font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      ) : (
        /* Coupon Code Input Form */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyCoupon();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Enter code (e.g. WELCOME10)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs uppercase font-bold text-bakery-dark focus:ring-1 focus:ring-bakery-caramel"
          />
          <button
            type="submit"
            disabled={validating || !couponCode.trim()}
            className="px-4 py-2 bg-bakery-caramel hover:bg-bakery text-white font-bold rounded-xl transition-colors disabled:opacity-50 min-w-[70px]"
          >
            {validating ? <ButtonLoader text="" /> : 'Apply'}
          </button>
        </form>
      )}

      {/* Available Offers Accordion */}
      {showOffers && activeCoupons.length > 0 && (
        <div className="pt-2 border-t border-cream-200 space-y-2 animate-fadeIn">
          <p className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">Available Bakery Offers</p>
          <div className="space-y-2">
            {activeCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-3 bg-white rounded-xl border border-cream-200 flex items-center justify-between gap-3 hover:border-bakery-caramel transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[11px] rounded border border-amber-300 font-mono">
                      {coupon.code}
                    </span>
                    <span className="font-bold text-bakery-dark text-xs">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {coupon.minOrderAmount ? `Min order ₹${coupon.minOrderAmount}` : 'No minimum order required'}
                    {coupon.maxDiscountAmount ? ` (Max cap ₹${coupon.maxDiscountAmount})` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyCoupon(coupon.code)}
                  className="px-3 py-1 bg-cream-200 hover:bg-bakery-caramel text-bakery-dark hover:text-white font-bold text-[11px] rounded-full transition-colors shrink-0"
                >
                  Apply Code
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
