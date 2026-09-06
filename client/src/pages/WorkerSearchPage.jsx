import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';
import SkillScoreMeter from '../components/common/SkillScoreMeter';

export default function WorkerSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedLevels, setSelectedLevels] = useState([1, 2, 3, 4]); // 1: Basic, 2: Skilled, 3: Expert, 4: Master
  const [minScore, setMinScore] = useState(0);
  const [minExp, setMinExp] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [sort, setSort] = useState(searchParams.get('sort') || 'highestScore');

  // Data States
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/workers/categories/list')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories', err));
  }, []);

  // Fetch workers whenever filters change
  useEffect(() => {
    async function fetchWorkers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (city) params.append('city', city);
        if (category) params.append('category', category);
        if (minScore > 0) params.append('minScore', minScore);
        if (minExp > 0) params.append('minExp', minExp);
        if (maxPrice < 3000) params.append('maxPrice', maxPrice);
        if (certifiedOnly) params.append('certifiedOnly', 'true');
        if (sort) params.append('sort', sort);

        // Append multiple levels
        selectedLevels.forEach(lvl => params.append('level', lvl));

        const res = await fetch(`/api/workers?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setWorkers(data.workers || []);
        }
      } catch (err) {
        console.error('Failed to fetch filtered workers', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
  }, [query, city, category, selectedLevels, minScore, minExp, maxPrice, certifiedOnly, sort]);

  const toggleLevel = (lvl) => {
    if (selectedLevels.includes(lvl)) {
      if (selectedLevels.length === 1) return; // keep at least 1 selected
      setSelectedLevels(selectedLevels.filter(l => l !== lvl));
    } else {
      setSelectedLevels([...selectedLevels, lvl]);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setCity('');
    setCategory('');
    setSelectedLevels([1, 2, 3, 4]);
    setMinScore(0);
    setMinExp(0);
    setMaxPrice(3000);
    setCertifiedOnly(false);
    setSort('highestScore');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Query */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl flex-1 w-full">
            <Search className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by specialty, trade or worker name..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl w-full md:w-44">
            <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Cities</option>
              <option value="Mumbai" className="bg-slate-900">Mumbai</option>
              <option value="Bengaluru" className="bg-slate-900">Bengaluru</option>
              <option value="Delhi NCR" className="bg-slate-900">Delhi NCR</option>
              <option value="Pune" className="bg-slate-900">Pune</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl w-full md:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Trades (14)</option>
              {categories.map(c => (
                <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl w-full md:w-56">
            <ArrowUpDown className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="highestScore" className="bg-slate-900">Highest Skill Score</option>
              <option value="mostExperienced" className="bg-slate-900">Most Experienced</option>
              <option value="lowestPrice" className="bg-slate-900">Lowest Price</option>
              <option value="successRate" className="bg-slate-900">Highest Job Success Rate</option>
              <option value="rating" className="bg-slate-900">Customer Satisfaction</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Sidebar + Right Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-display font-bold text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                Filter Professionals
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* 1. Skill Level Pill Checkboxes */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Worker Skill Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Level 4 Master */}
                <button
                  type="button"
                  onClick={() => toggleLevel(4)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    selectedLevels.includes(4)
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-glow'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span>🟡</span> Master
                </button>

                {/* Level 3 Expert */}
                <button
                  type="button"
                  onClick={() => toggleLevel(3)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    selectedLevels.includes(3)
                      ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-glow-purple'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span>🟣</span> Expert
                </button>

                {/* Level 2 Skilled */}
                <button
                  type="button"
                  onClick={() => toggleLevel(2)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    selectedLevels.includes(2)
                      ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-glow-blue'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span>🔵</span> Skilled
                </button>

                {/* Level 1 Basic */}
                <button
                  type="button"
                  onClick={() => toggleLevel(1)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    selectedLevels.includes(1)
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-glow-green'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span>🟢</span> Basic
                </button>
              </div>
            </div>

            {/* 2. Minimum Skill Score Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Min Skill Score</span>
                <span className="font-mono font-bold text-amber-400">{minScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Any (0)</span>
                <span>Skilled (65+)</span>
                <span>Master (90+)</span>
              </div>
            </div>

            {/* 3. Minimum Experience */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Min Experience</span>
                <span className="font-mono font-bold text-purple-400">{minExp} Yrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* 4. Maximum Price Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Max Price</span>
                <span className="font-mono font-bold text-emerald-400">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="300"
                max="3000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 5. Verified Certifications Only Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-300 font-medium">Verified Certifications Only</span>
                <input
                  type="checkbox"
                  checked={certifiedOnly}
                  onChange={(e) => setCertifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing <strong className="text-white">{workers.length}</strong> skill-verified professionals</span>
            <span>Sorted by: <strong className="text-emerald-400 capitalize">{sort.replace(/([A-Z])/g, ' $1')}</strong></span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">Filtering skill registry records...</p>
            </div>
          ) : workers.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-lg text-white">No professionals match current filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try expanding your skill score range or selecting additional tiers (Basic, Skilled, Expert, Master).
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className={`glass-card glass-card-hover rounded-2xl p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                    worker.level === 4 ? 'border-amber-500/40 hover:border-amber-400' : 'border-slate-800'
                  }`}
                >
                  {/* Left: Avatar & Basic Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-white hover:text-emerald-400 transition-colors">
                          <Link to={`/worker/${worker.id}`}>{worker.name}</Link>
                        </h3>
                        <SkillBadge level={worker.level} size="sm" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{worker.specialty} • {worker.city}</p>
                      
                      {/* Metric pills */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {worker.experienceYears} Yrs Exp
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {worker.jobsCompleted} Jobs ({worker.stats?.jobSuccessRate}% Success)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Skill Breakdown snippet */}
                  <div className="hidden sm:block min-w-[200px] space-y-1.5 border-l border-slate-800 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Audited Skills
                    </span>
                    {worker.skillBreakdown?.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[130px]">{s.name}</span>
                        <span className="font-mono font-bold text-slate-200">{s.score}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Right: Score Gauge, Pricing & CTA */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <SkillScoreMeter
                      score={worker.skillScore}
                      size="sm"
                      workerName={worker.name}
                      breakdownData={worker.scoreComponents}
                    />

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">Standard</span>
                      <span className="text-base font-black font-display text-white">
                        ₹{worker.pricing?.basePrice?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/worker/${worker.id}`}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/worker/${worker.id}?book=true`}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
