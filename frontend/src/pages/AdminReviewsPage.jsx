import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, XCircle, Trash2, Star, Filter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      if (res.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const res = await api.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      if (res.success) {
        showToast(`Review ${newStatus.toLowerCase()} successfully`, 'info');
        loadReviews();
      }
    } catch (e) {
      showToast(e.message || 'Error updating review status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/reviews/${deleteTarget.id}`);
      showToast('Review deleted', 'info');
      loadReviews();
    } catch (e) {
      showToast(e.message || 'Error deleting review', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bakery-dark">CUSTOMER REVIEW MODERATION</h1>
          <p className="text-xs text-gray-500 mt-1">Review, approve, or reject customer feedback for product pages.</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-cream-300 rounded-lg font-bold text-bakery-dark"
          >
            <option value="ALL">All Statuses ({reviews.length})</option>
            <option value="PENDING">Pending Moderation ({reviews.filter(r => r.status === 'PENDING').length})</option>
            <option value="APPROVED">Approved ({reviews.filter(r => r.status === 'APPROVED').length})</option>
            <option value="REJECTED">Rejected ({reviews.filter(r => r.status === 'REJECTED').length})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 py-8 text-center">Loading customer reviews for moderation...</p>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-cream-200 text-center text-xs text-gray-400">
          No reviews found matching status filter "{statusFilter}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-100 pb-2 text-xs">
                <div>
                  <span className="font-bold text-bakery-dark text-sm">{rev.userName}</span>
                  <span className="text-[11px] text-gray-500 ml-2">on product: <strong>{rev.productName}</strong></span>
                  {rev.isVerifiedPurchase && (
                    <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Verified Buyer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rev.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    rev.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rev.status}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>

              <p className="text-xs text-gray-700 leading-relaxed font-medium">{rev.reviewText}</p>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-[11px] text-gray-400">Helpful count: {rev.helpfulCount || 0}</span>

                <div className="flex items-center gap-2">
                  {rev.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-full transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}

                  {rev.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'REJECTED')}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-full transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteTarget(rev)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Customer Review?"
        message={`Are you sure you want to permanently remove review by ${deleteTarget?.userName}?`}
        confirmText="Delete Review"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
