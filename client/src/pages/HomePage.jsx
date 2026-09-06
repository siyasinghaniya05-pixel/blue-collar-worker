import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Cpu,
  BadgeCheck
} from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';
import SkillScoreMeter from '../components/common/SkillScoreMeter';

// Category icons map
import {
  Wrench,
  Hammer,
  AirVent,
  Paintbrush,
  Tv,
  Camera,
  Code,
  GraduationCap,
  Palette,
  Gauge,
  SunMedium
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Zap': Zap,
  'Wrench': Wrench,
  'Hammer': Hammer,
  'AirVent': AirVent,
  'Paintbrush': Paintbrush,
  'Sparkles': Sparkles,
  'Tv': Tv,
  'ShieldCheck': ShieldCheck,
  'Gauge': Gauge,
  'GraduationCap': GraduationCap,
  'Palette': Palette,
  'Code': Code,
  'Camera': Camera,
  'SunMedium': SunMedium
};

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Mumbai');
  const [categories, setCategories] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, workerRes] = await Promise.all([
          fetch('/api/workers/categories/list'),
          fetch('/api/workers?sort=highestScore')
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        if (workerRes.ok) {
          const workerData = await workerRes.json();
          setTopWorkers(workerData.workers || []);
        }
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(query)}&city=${encodeURIComponent(location)}`);
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            The Verified Professional Revolution
          </span>
          <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
            • 4 Skill Tiers
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          Don't Hire by Stars. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">
            Hire by Skill.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Find verified professionals based on real skills, practical assessments and proven performance — not easily manipulated 5-star reviews.
        </p>

        {/* Search Bar Container */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-3xl mx-auto p-2 bg-slate-900/90 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2"
        >
          {/* Query input */}
          <div className="flex items-center gap-3 px-4 py-3 w-full flex-1">
            <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What service do you need? (e.g., Electrician, AC Repair, Plumber)"
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="hidden sm:block w-[1px] h-8 bg-slate-800" />

          {/* Location selector */}
          <div className="flex items-center gap-2 px-4 py-3 w-full sm:w-48">
            <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer w-full"
            >
              <option value="Mumbai" className="bg-slate-900 text-white">Mumbai</option>
              <option value="Bengaluru" className="bg-slate-900 text-white">Bengaluru</option>
              <option value="Delhi NCR" className="bg-slate-900 text-white">Delhi NCR</option>
              <option value="Pune" className="bg-slate-900 text-white">Pune</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <span>Search Verified</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
          <span className="text-slate-500">Popular:</span>
          {['Master Electricians', 'Inverter AC Techs', 'Concealed Leak Plumbers', 'Appliance PCB', 'Web Developers'].map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                navigate(`/search?query=${encodeURIComponent(item)}&city=${encodeURIComponent(location)}`);
              }}
              className="hover:text-emerald-400 hover:border-emerald-500/50 transition-colors bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* 2. 4-TIER WORKER LEVEL SYSTEM BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block mb-2">
              Worker Hierarchy Standard
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              The 4-Tier Skill Verification System
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every professional's tier is earned through objective practical exams, verified experience, and background checks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level 1: Basic */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🟢</span>
                <span className="text-xs font-mono font-bold text-emerald-400">₹299+</span>
              </div>
              <h3 className="font-display font-bold text-base text-white">Level 1 — Basic</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Beginner • Basic skill assessment passed • Limited experience • Entry-level pricing
              </p>
              <div className="text-[11px] text-emerald-300/80 font-medium">
                Score Range: 0–64
              </div>
            </div>

            {/* Level 2: Skilled */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/30 hover:border-blue-500/60 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🔵</span>
                <span className="text-xs font-mono font-bold text-blue-400">₹499+</span>
              </div>
              <h3 className="font-display font-bold text-base text-white">Level 2 — Skilled</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practical assessment passed • Verified experience • Good customer performance • Medium pricing
              </p>
              <div className="text-[11px] text-blue-300/80 font-medium">
                Score Range: 65–79
              </div>
            </div>

            {/* Level 3: Expert */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-500/60 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🟣</span>
                <span className="text-xs font-mono font-bold text-purple-400">₹799+</span>
              </div>
              <h3 className="font-display font-bold text-base text-white">Level 3 — Expert</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Advanced practical test • Strong experience • Multiple verified jobs • High satisfaction • Premium pricing
              </p>
              <div className="text-[11px] text-purple-300/80 font-medium">
                Score Range: 80–89
              </div>
            </div>

            {/* Level 4: Master */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-950/90 border-2 border-amber-500/50 hover:border-amber-400 transition-all space-y-3 relative shadow-glow">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                Top Tier
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🟡</span>
                <span className="text-xs font-mono font-bold text-amber-400">₹1,199+</span>
              </div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-1.5">
                Level 4 — Master
                <BadgeCheck className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Highest test scores • Extensive experience • Exceptional job performance • Industry certified
              </p>
              <div className="text-[11px] text-amber-300 font-bold">
                Score Range: 90–100
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICE CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-1">
              Verified Trades
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Explore Services by Trade
            </h2>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View all 14 categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat.icon] || Wrench;
            return (
              <Link
                key={cat.id}
                to={`/search?category=${encodeURIComponent(cat.name)}`}
                className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-950/20 transition-all mb-3">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500 mt-1">
                  From ₹{cat.minPrice}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. TOP VERIFIED PROFESSIONALS & HIGHEST SKILL SCORES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block mb-1">
              Top Verified Professionals
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Highest Skill Scores on Platform
            </h2>
          </div>
          <Link
            to="/search?sort=highestScore"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Browse all ranked workers <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topWorkers.slice(0, 6).map((worker) => (
            <div
              key={worker.id}
              className={`glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-5 border ${
                worker.level === 4 ? 'border-amber-500/40 hover:border-amber-400' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Card Top: Avatar, Name, Tier, and Skill Score */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-base text-white">{worker.name}</h3>
                      <p className="text-xs text-slate-400">{worker.specialty}</p>
                      <div className="mt-1">
                        <SkillBadge level={worker.level} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Skill Score Radial Meter */}
                  <SkillScoreMeter
                    score={worker.skillScore}
                    size="sm"
                    workerName={worker.name}
                    breakdownData={worker.scoreComponents}
                  />
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Exp</span>
                    <span className="text-xs font-bold text-white">{worker.experienceYears} Yrs</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Jobs</span>
                    <span className="text-xs font-bold text-white">{worker.jobsCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Success</span>
                    <span className="text-xs font-bold text-emerald-400">{worker.stats?.jobSuccessRate}%</span>
                  </div>
                </div>

                {/* Top 3 Verified Skill Bars */}
                {worker.skillBreakdown && (
                  <div className="space-y-1.5 mb-4">
                    {worker.skillBreakdown.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 truncate max-w-[170px]">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${s.score}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-300 text-[10px] w-6 text-right font-bold">
                            {s.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Pricing & Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Standard Service</span>
                  <span className="text-sm font-bold font-mono text-white">
                    ₹{worker.pricing?.basePrice?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/worker/${worker.id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to={`/worker/${worker.id}?book=true`}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow transition-colors"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. THE DIFFERENTIATOR: TRADITIONAL MARKETPLACE VS SKILLSERVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block mb-2">
              The Fundamental Difference
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Why Traditional Marketplaces Fail Skilled Workers & Customers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3">
              On UrbanClap and Justdial, almost everyone shows "4.7 stars", but nobody knows who can actually solder an Inverter PCB or diagnose a dead short circuit safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Marketplaces */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-red-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Traditional Marketplaces (UrbanClap / Justdial)</h3>
                  <p className="text-xs text-slate-400">Rating-based matching without skill testing</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Subjective Star Ratings:</strong> Highly volatile and easily boosted with friends/family reviews or free discounts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Technical Verification:</strong> Workers self-claim experience without practical bench testing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Skilled Workers Underpaid:</strong> A 10-year master technician gets paid the exact same flat fee as an amateur beginner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No Digital Credential:</strong> Customer has no way to verify on-site certifications or government safety credentials.</span>
                </li>
              </ul>
            </div>

            {/* SkillServe Platform */}
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4 shadow-glow-green">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">The SkillServe Platform</h3>
                  <p className="text-xs text-emerald-300 font-medium">Audited practical benchmarks & tiered pay</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Practical Diagnostic Assessments:</strong> Rigorous 40%-weighted scenario tests with circuit/tool simulations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Transparent 0–100 Skill Score:</strong> Mathematical formula incorporating tests, audited experience, and success rate.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Skill-Based Fair Pricing:</strong> Master tiers earn premium rates (₹1,199+), solving technician underpayment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Digital Skill Passport & QR:</strong> Instant on-site verification of certificates, police record, and tested skill areas.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW SKILLSERVE VERIFICATION WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-2">
            The Audit Pipeline
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            How SkillServe Verification Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Our multi-stage verification ensures that every professional on your premises is thoroughly tested and authenticated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <span className="text-3xl font-black font-display text-slate-700/60 block mb-2">01</span>
            <h3 className="font-bold text-base text-white mb-2">Identity & Background</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Govt ID, Aadhaar verification, and state police background checks to eliminate fraud and guarantee home safety.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <span className="text-3xl font-black font-display text-slate-700/60 block mb-2">02</span>
            <h3 className="font-bold text-base text-white mb-2">Practical Bench Test</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive technical assessment covering diagnostic accuracy, safety procedures, and domain trouble-shooting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <span className="text-3xl font-black font-display text-slate-700/60 block mb-2">03</span>
            <h3 className="font-bold text-base text-white mb-2">Skill Score Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent 0-100 algorithm calculates composite rating using weighted practical metrics and verified experience.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <span className="text-3xl font-black font-display text-slate-700/60 block mb-2">04</span>
            <h3 className="font-bold text-base text-white mb-2">Tier & Skill Passport</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Worker receives official Level 1-4 Tier badge, platform fair-pay approval, and scannable digital Skill Passport.
            </p>
          </div>
        </div>
      </section>

      {/* 7. WORKER SUCCESS STORIES & CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              For Service Professionals
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              "Prove Your Skill. Earn What You're Worth."
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tired of being lumped together with low-quality workers? Take the SkillServe practical diagnostic assessment, unlock Master Tier pricing, and earn up to 3x standard marketplace rates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/worker-dashboard"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/30 transition-all text-center"
            >
              Become a Verified Professional
            </Link>
            <Link
              to="/search"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all text-center"
            >
              Find a Professional
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
