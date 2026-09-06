import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, Flag } from 'lucide-react';
import api from '../utils/api';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/admin/reviews');
        setReviews(res.data.reviews || res.data || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const flagReview = async (review) => {
    try {
      const res = await api.put(`/admin/reviews/${review._id}/flag`, { isFlagged: !review.isFlagged });
      setReviews((prev) => prev.map((r) => (r._id === review._id ? { ...r, isFlagged: res.data.review.isFlagged } : r)));
      toast.success(res.data.review.isFlagged ? 'Review flagged' : 'Review unflagged');
    } catch (err) {
      toast.error('Failed to update review');
    }
  };

  const filtered = reviews.filter((r) => {
    return !search ||
      r.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.worker?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search reviews..."
          />
        </div>

        <p className="text-sm text-gray-500">{filtered.length} reviews</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">Reviews will appear here once customers leave feedback</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {getInitials(review.customer?.name || 'C')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {review.customer?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        → {review.worker?.user?.name || 'Worker'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.ratings?.overall || review.rating} />
                    <button
                      onClick={() => flagReview(review)}
                      className={`p-1.5 transition-colors rounded-lg ${
                        review.isFlagged ? 'text-amber-600 hover:text-red-500 bg-amber-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title={review.isFlagged ? 'Unflag review' : 'Flag review'}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{review.comment || 'No comment'}</p>
                <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
}
