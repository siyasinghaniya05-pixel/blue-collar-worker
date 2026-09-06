import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, CalendarDays, IndianRupee, ClipboardCheck,
  ArrowUpRight, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import api from '../utils/api';
import SkillBadge from '../components/common/SkillBadge';
import SkillScore from '../components/common/SkillScore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/workers/dashboard/stats').catch(() => ({ data: { stats: {} } })),
          api.get('/bookings').catch(() => ({ data: { bookings: [] } })),
        ]);
        setStats(statsRes.data.stats);
        setRecentBookings((bookingsRes.data.bookings || bookingsRes.data || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const profile = user?.workerProfile || {};

  const statCards = [
    {
      label: 'Skill Score',
      value: profile.skillScore || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      suffix: '',
      isScore: true,
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || recentBookings.length || 0,
      icon: CalendarDays,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Completed',
      value: stats?.completedBookings || profile.completedJobs || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Earnings',
      value: formatCurrency(stats?.totalEarnings || 0),
      icon: IndianRupee,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      isText: true,
    },
  ];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-1">Welcome back, {user?.name}!</h2>
          <p className="text-primary-100">Here's your work overview</p>
          <div className="flex items-center gap-4 mt-4">
            <SkillBadge level={profile.skillLevel || 'basic'} size="md" />
            <SkillScore score={profile.skillScore || 0} size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {card.isScore ? <SkillScore score={card.value} size="sm" /> : card.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <Link to="/worker/bookings" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.service?.name || 'Service'}</p>
                    <p className="text-xs text-gray-500">{formatDate(booking.scheduledDate)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/worker/assessments"
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <ClipboardCheck className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Take Assessment</h3>
            <p className="text-sm text-gray-500 mt-1">Improve your skill score with assessments</p>
          </Link>
          <Link
            to="/worker/skill-progress"
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Skill Progress</h3>
            <p className="text-sm text-gray-500 mt-1">Track your skill growth over time</p>
          </Link>
        </div>
      </div>
  );
}
