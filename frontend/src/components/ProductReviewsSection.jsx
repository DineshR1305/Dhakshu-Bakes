import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle2, AlertCircle, MessageSquare, Edit3, Filter } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { ButtonLoader } from './Loaders';
import api from '../services/api';

export default function ProductReviewsSection({ productId, productName }) {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Sorting state
  const [sortBy, setSortBy] = useState('recent'); // recent, highest, lowest, verified

  useEffect(() => {
    if (productId) {
      loadReviewsAndSummary();
    }
  }, [productId]);

  const loadReviewsAndSummary = async () => {
    setLoading(true);
    try {
      const [revRes, sumRes] = await Promise.all([
        api.get(`/reviews/product/${productId}`),
        api.get(`/reviews/product/${productId}/summary`),
      ]);

      if (revRes.success && Array.isArray(revRes.data)) {
        setReviews(revRes.data);
      }
      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to leave a product review', 'warning');
      return;
    }

    if (!reviewText.trim()) {
      showToast('Please write a short review text', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (editingReviewId) {
        res = await api.put(`/reviews/${editingReviewId}`, {
          productId,
          rating,
          reviewText: reviewText.trim(),
        });
      } else {
        res = await api.post('/reviews', {
          productId,
          rating,
          reviewText: reviewText.trim(),
        });
      }

      if (res.success) {
        showToast(res.message || 'Review submitted for moderation!', 'success');
        setReviewText('');
        setRating(5);
        setEditingReviewId(null);
        loadReviewsAndSummary();
      } else {
        showToast(res.message || 'Could not submit review', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      const res = await api.post(`/reviews/${reviewId}/helpful`);
      if (res.success) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));
        showToast('Thank you for your feedback!', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    if (sortBy === 'verified') return (b.isVerifiedPurchase ? 1 : 0) - (a.isVerifiedPurchase ? 1 : 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-8">
      <div className="flex items-center justify-between border-b border-cream-200 pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-bakery-dark flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-bakery-caramel" />
          <span>Customer Reviews & Ratings</span>
        </h3>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-cream-100 border border-cream-300 rounded-lg font-bold text-bakery-dark"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="verified">Verified Purchase First</option>
          </select>
        </div>
      </div>

      {/* Summary Rating Breakdown */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-cream-50/70 rounded-2xl border border-cream-200 items-center">
          <div className="text-center md:border-r border-cream-200 md:pr-6 space-y-1">
            <span className="font-serif text-5xl font-extrabold text-bakery-dark block">{summary.averageRating}</span>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.round(summary.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-500">Based on {summary.totalReviews} verified reviews</p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-gray-600">
            {[
              { label: '5 ★', count: summary.fiveStarCount },
              { label: '4 ★', count: summary.fourStarCount },
              { label: '3 ★', count: summary.threeStarCount },
              { label: '2 ★', count: summary.twoStarCount },
              { label: '1 ★', count: summary.oneStarCount },
            ].map((item, i) => {
              const pct = summary.totalReviews > 0 ? Math.round((item.count / summary.totalReviews) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-8 text-right font-bold">{item.label}</span>
                  <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="w-10 text-right text-[11px] text-gray-400">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Submission Form */}
      <div className="p-5 bg-cream-50/50 rounded-2xl border border-cream-200 space-y-4">
        <h4 className="font-serif font-bold text-base text-bakery-dark">
          {editingReviewId ? 'Edit Your Product Review' : `Write a Review for ${productName}`}
        </h4>

        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Select Rating Star</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} stars out of 5`}
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Your Review / Comments *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe taste, texture, freshness, packaging, or delivery experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 bg-white border border-cream-300 rounded-xl text-xs text-bakery-dark focus:ring-1 focus:ring-bakery-caramel"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-500">Reviews from verified purchasers display a Verified Purchaser badge.</span>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-bakery-caramel hover:bg-bakery text-white font-bold rounded-full shadow-xs transition-all disabled:opacity-50"
              >
                {submitting ? <ButtonLoader text="Submitting..." /> : editingReviewId ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-gray-500">
            Please <a href="/login" className="font-bold text-bakery-caramel hover:underline">sign in</a> to leave a review.
          </p>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-gray-400 py-4 text-center">Loading customer reviews...</p>
        ) : sortedReviews.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center italic">No approved reviews yet for this bake. Be the first to review!</p>
        ) : (
          sortedReviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-white rounded-2xl border border-cream-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-bakery-dark text-sm">{rev.userName || 'Verified Customer'}</span>
                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-gray-400">
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed pt-1">{rev.reviewText}</p>

              <div className="flex items-center justify-between pt-2 border-t border-cream-100 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleMarkHelpful(rev.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-bakery-caramel transition-colors font-medium"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpfulCount || 0})</span>
                </button>

                {user && rev.userName === user.fullName && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReviewId(rev.id);
                      setRating(rev.rating);
                      setReviewText(rev.reviewText);
                    }}
                    className="text-bakery-caramel hover:underline font-bold flex items-center gap-0.5"
                  >
                    <Edit3 className="w-3 h-3" /> Edit My Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
