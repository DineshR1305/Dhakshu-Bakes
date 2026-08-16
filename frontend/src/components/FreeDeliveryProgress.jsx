import React from 'react';
import { Truck, Sparkles, CheckCircle2 } from 'lucide-react';

const FREE_DELIVERY_THRESHOLD = 499;

export default function FreeDeliveryProgress({ subtotal = 0, className = '' }) {
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.max(0, (subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const isUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD;

  return (
    <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-cream-100 via-white to-cream-100 border border-cream-200 shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-bakery-dark">
          {isUnlocked ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Truck className="w-4 h-4 text-bakery-caramel shrink-0 animate-bounce" />
          )}
          <span>
            {subtotal === 0 ? (
              'Free Delivery on orders over ₹499!'
            ) : isUnlocked ? (
              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                🎉 You've unlocked FREE DELIVERY!
              </span>
            ) : (
              <>
                Add <strong className="text-bakery-caramel">₹{remaining}</strong> more for <strong className="text-emerald-700 uppercase tracking-wider text-[11px]">FREE DELIVERY</strong>
              </>
            )}
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-gray-500 shrink-0">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden p-0.5 border border-cream-300/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isUnlocked
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs'
              : 'bg-gradient-to-r from-bakery-caramel to-bakery-gold'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
