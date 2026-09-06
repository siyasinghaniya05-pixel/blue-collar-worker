import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, IndianRupee, Briefcase, CheckCircle2,
  ArrowLeft, CalendarDays, MessageSquare, ExternalLink,
} from 'lucide-react';
import api from '../utils/api';
import SkillBadge from '../components/common/SkillBadge';
import SkillScore from '../components/common/SkillScore';
import VerificationBadge from '../components/common/VerificationBadge';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getInitials, formatCurrency, formatDate, pluralize } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function WorkerProfilePage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await api.get(`/workers/${id}`);
        setWorker(res.data.worker || res.data);
      } catch (err) {
        toast.error('Worker not found');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id, navigate]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/worker/${id}`);
        setReviews(res.data.reviews || res.data || []);
      } catch (err) {
        // Reviews might not be available
      }
    };
    if (id) fetchReviews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading worker profile..." />
      </div>
    );
  }

  if (!worker) return null;

  const user_ = worker.user || worker;
  const profile = worker.workerProfile || user_.workerProfile || worker;
  const verifications = profile.verifications || {};

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a worker');
      navigate('/login');
      return;
    }
    navigate(`/bookings/new?worker=${worker._id || user_._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 h-32" />

          <div className="px-6 sm:px-8 pb-8 -mt-12 relative z-10">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end mb-6">
              <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {getInitials(user_.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user_.name}</h1>
                  {verifications.identity && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-gray-500 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {profile.category || 'Professional'} • {profile.experience || 0} {pluralize(profile.experience || 0, 'year', 'years')} experience
                </p>
                {(user_.location || profile.location) && (
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user_.location || profile.location}
                  </p>
                )}
              </div>
              <button
                onClick={handleBookNow}
                className="px-8 py-3 font-semibold text-white rounded-xl gradient-primary hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98]"
              >
                Book Now
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <SkillScore score={profile.skillScore || 0} size="md" />
                <p className="text-xs text-gray-500 mt-1">Skill Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.completedJobs || profile.stats?.completedJobs || 0}</p>
                <p className="text-xs text-gray-500">Jobs Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.successRate || profile.stats?.successRate || 0}%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.satisfaction || profile.stats?.satisfaction || 0}%</p>
                <p className="text-xs text-gray-500">Satisfaction</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <SkillBadge level={profile.skillLevel || 'basic'} size="lg" />
              <StarRating rating={profile.averageRating || 0} />
              <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">
                  {profile.bio || 'This professional has not added a bio yet.'}
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Pricing</h2>
                <div className="flex items-center gap-2 text-gray-700">
                  <IndianRupee className="w-5 h-5" />
                  <span className="text-2xl font-bold">{formatCurrency(profile.hourlyRate || profile.pricing?.hourly || 0)}</span>
                  <span className="text-sm text-gray-400">/hour</span>
                </div>
                {profile.pricing?.daily && (
                  <p className="text-sm text-gray-500 mt-1">
                    Daily: {formatCurrency(profile.pricing.daily)}
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Verifications</h2>
                <VerificationBadge verifications={verifications} />
              </div>
            </div>

            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg border border-primary-100"
                    >
                      {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review, i) => (
                    <div key={review._id || i} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {review.customer?.name || 'Customer'}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
