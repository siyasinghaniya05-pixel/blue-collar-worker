import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Eye, Filter } from 'lucide-react';
import api from '../utils/api';
import SkillBadge from '../components/common/SkillBadge';
import SkillScore from '../components/common/SkillScore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getInitials, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await api.get('/admin/workers');
        setWorkers(res.data.workers || res.data || []);
      } catch (err) {
        console.error('Failed to fetch workers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleVerify = async (workerId, field, value) => {
    try {
      await api.put(`/admin/workers/${workerId}/verify`, { field, value });
      setWorkers((prev) =>
        prev.map((w) =>
          w._id === workerId
            ? { ...w, verified: { ...(w.verified || {}), [field]: value } }
            : w
        )
      );
      toast.success(`Verification ${value ? 'approved' : 'removed'}`);
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  const filtered = workers.filter((w) => {
    const name = w.user?.name || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (w.serviceCategory || '').toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'all' || (w.skillLevel || '') === levelFilter;
    return matchSearch && matchLevel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading workers..." />
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
              placeholder="Search workers..."
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Levels</option>
            <option value="basic">Basic</option>
            <option value="skilled">Skilled</option>
            <option value="expert">Expert</option>
            <option value="master">Master</option>
          </select>
        </div>

        <p className="text-sm text-gray-500">{filtered.length} workers</p>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jobs</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((worker) => {
                  return (
                    <motion.tr
                      key={worker._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(worker.user?.name || 'W')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{worker.user?.name || 'Worker'}</p>
                            <p className="text-xs text-gray-500">{worker.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <SkillBadge level={worker.skillLevel || 'basic'} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <SkillScore score={worker.skillScore?.overall || 0} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {worker.stats?.jobs || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(worker.user?.createdAt || worker.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleVerify(
                                worker._id,
                                'identity',
                                !worker.verified?.identity
                              )
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              worker.verified?.identity
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                            }`}
                            title="Toggle identity verification"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No workers found</p>
            </div>
          )}
        </div>
      </div>
  );
}
