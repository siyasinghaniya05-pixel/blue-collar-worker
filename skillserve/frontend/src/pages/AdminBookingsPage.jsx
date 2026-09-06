import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Search, Filter } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/admin/bookings');
        setBookings(res.data.bookings || res.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      toast.success('Booking status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid transition for this booking');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchSearch = !search ||
      b.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.worker?.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search bookings..."
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'worker_assigned', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'disputed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500">{filtered.length} bookings</p>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((booking) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                          {getInitials(booking.customer?.name || 'C')}
                        </div>
                        <span className="text-sm text-gray-700">{booking.customer?.name || 'Customer'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-[10px] font-bold">
                          {getInitials(booking.worker?.name || 'W')}
                        </div>
                        <span className="text-sm text-gray-700">{booking.worker?.user?.name || 'Worker'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{booking.service?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(booking.scheduledDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                      >
                        {Object.keys(statusColors).map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      </div>
  );
}
