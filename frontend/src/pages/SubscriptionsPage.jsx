import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle2, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function SubscriptionsPage() {
  const { isAuthenticated } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      if (isAuthenticated) {
        try {
          const res = await api.get('/subscriptions');
          if (res.success) setSubscriptions(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadSubs();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/subscriptions/${id}/status`, { status });
      if (res.success) {
        setSubscriptions(subscriptions.map(s => s.id === id ? res.data : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-cream-200 text-bakery-caramel px-3.5 py-1.5 rounded-full text-xs font-bold border border-cream-300">
          <Calendar className="w-4 h-4" /> Fresh Weekly Delivery Subscriptions
        </div>
        <h1 className="font-serif text-4xl font-extrabold text-bakery-dark">RECURRING BAKERY CLUB</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Never run out of your favorite brownies, cookies, or fresh breakfast croissants. Subscribe weekly, bi-weekly, or monthly and pause anytime.
        </p>
      </div>

      {isAuthenticated && (
        <div className="bg-white p-6 rounded-3xl border border-cream-200 space-y-6">
          <h3 className="font-serif font-bold text-lg text-bakery-dark">My Active Subscriptions</h3>
          {subscriptions.length === 0 ? (
            <p className="text-xs text-gray-500">You do not have any active subscriptions yet.</p>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 bg-cream-100/60 rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-bakery-dark">{sub.product?.name} ({sub.variant?.variantName})</h4>
                    <p className="text-xs text-bakery-caramel font-semibold">Frequency: {sub.frequency} • Next Delivery: {sub.nextDeliveryDate}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, 'PAUSED')}
                        className="px-3 py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <PauseCircle className="w-4 h-4" /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, 'ACTIVE')}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <PlayCircle className="w-4 h-4" /> Resume
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(sub.id, 'CANCELLED')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
