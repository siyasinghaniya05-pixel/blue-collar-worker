import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, IndianRupee, Filter } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SkillBadge from '../components/common/SkillBadge';
import { formatDate, formatCurrency, getInitials } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  worker_assigned: 'bg-indigo-100 text-indigo-800',
  on_the_way: 'bg-cyan-100 text-cyan-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800',
};

export default function BookingsListPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.bookings || res.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner message="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 mt-1">Manage your service bookings</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'worker_assigned', 'on_the_way', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-4">Start by finding a skilled worker</p>
            <Link to="/search" className="btn-primary inline-flex items-center gap-2">
              Find Workers
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking, i) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(booking.worker?.user?.name || booking.worker?.name || booking.workerName || 'W')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.worker?.user?.name || booking.worker?.name || booking.workerName || 'Worker'}
                      </p>
                      <p className="text-sm text-gray-500">{booking.service?.name || booking.serviceType}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{booking.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(booking.scheduledDate || booking.preferredDate)}
                  </div>
                  {booking.scheduledTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {booking.scheduledTime}
                    </div>
                  )}
                  {booking.address?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{booking.address.city}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
