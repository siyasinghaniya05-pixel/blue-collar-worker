import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, MapPin, IndianRupee } from 'lucide-react';
import api from '../utils/api';
import WorkerCard from '../components/common/WorkerCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const categories = [
  'All', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason',
  'Welder', 'AC Technician', 'Mechanic', 'Tailor', 'Cook', 'Gardener',
];

const skillLevels = ['All', 'basic', 'skilled', 'expert', 'master'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [skillLevel, setSkillLevel] = useState(searchParams.get('level') || 'All');
  const [maxRate, setMaxRate] = useState(searchParams.get('maxRate') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('skillScore');

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      if (category !== 'All') params.set('category', category);
      if (skillLevel !== 'All') params.set('skillLevel', skillLevel);
      if (maxRate) params.set('maxRate', maxRate);
      params.set('sort', sortBy);

      const res = await api.get(`/workers?${params.toString()}`);
      setWorkers(res.data.workers || res.data || []);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, skillLevel, maxRate, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(fetchWorkers, 300);
    return () => clearTimeout(debounce);
  }, [fetchWorkers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setSkillLevel('All');
    setMaxRate('');
    setSortBy('skillScore');
    setSearchParams({});
  };

  const hasFilters = category !== 'All' || skillLevel !== 'All' || maxRate !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                placeholder="Search by name, skill, or category..."
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
                showFilters || hasFilters
                  ? 'bg-primary-50 border-primary-200 text-primary-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Filters</span>
            </button>
          </form>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="input-field text-sm"
                >
                  {skillLevels.map((l) => (
                    <option key={l} value={l}>
                      {l === 'All' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Max Rate (₹/hr)
                </label>
                <input
                  type="number"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  className="input-field text-sm"
                  placeholder="No limit"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="skillScore">Skill Score</option>
                  <option value="hourlyRate">Price: Low to High</option>
                  <option value="-hourlyRate">Price: High to Low</option>
                  <option value="completedJobs">Experience</option>
                </select>
              </div>
            </motion.div>
          )}

          {hasFilters && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${workers.length} professional${workers.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="Finding the best workers..." />
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker, i) => (
              <motion.div
                key={worker._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <WorkerCard worker={worker} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
