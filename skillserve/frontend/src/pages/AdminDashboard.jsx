import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, CalendarDays, TrendingUp, IndianRupee, ArrowUpRight,
  BarChart3, Star,
} from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.dashboard);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Workers',
      value: stats?.users?.workers || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/workers',
    },
    {
      label: 'Total Bookings',
      value: stats?.bookings?.total || 0,
      icon: CalendarDays,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/admin/bookings',
    },
    {
      label: 'Active Bookings',
      value: Math.max((stats?.bookings?.total || 0) - (stats?.bookings?.completed || 0), 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      link: '/admin/bookings',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.revenue?.total || 0),
      icon: IndianRupee,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      isText: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-1">Admin Dashboard</h2>
          <p className="text-gray-400">Overview of the SkillServe platform</p>
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
              >
                <Link
                  to={card.link || '#'}
                  className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    {card.link && <ArrowUpRight className="w-4 h-4 text-gray-400" />}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/admin/workers"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Manage Workers</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/admin/bookings"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">View Bookings</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/admin/reviews"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Monitor Reviews</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-gray-400" />
              Platform Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-bold text-gray-900">{stats?.avgRating || 0} / 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="font-bold text-gray-900">{formatCurrency(stats?.revenue?.monthly || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bookings This Month</span>
                <span className="font-bold text-gray-900">{stats?.bookings?.monthly || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Bookings</span>
                <span className="font-bold text-gray-900">{stats?.bookings?.pending || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
