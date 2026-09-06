import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Award,
  ChevronRight
} from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';
import SkillScoreMeter from '../components/common/SkillScoreMeter';

export default function SmartMatchPage() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [location, setLocation] = useState('Mumbai');
  const [budget, setBudget] = useState(1500);
  const [urgency, setUrgency] = useState('today');

  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Load problem diagnoses
  useEffect(() => {
    fetch('/api/match/diagnoses')
      .then(res => res.json())
      .then(data => {
        setDiagnoses(data);
        if (data.length > 0) {
          setSelectedProblem(data[0].id);
          // Run initial match for default problem
          runMatch(data[0].id, 'Mumbai', 1500);
        }
      })
      .catch(err => console.error('Failed to load diagnoses', err));
  }, []);

  const runMatch = async (problemId, loc, maxBudget) => {
    setLoading(true);
    try {
      const res = await fetch('/api/match/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problemId || selectedProblem,
          location: loc || location,
          maxBudget: maxBudget || budget,
          urgency
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMatchResult(data);
      }
    } catch (err) {
      console.error('Error in smart matching', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProblemChange = (id) => {
    setSelectedProblem(id);
    runMatch(id, location, budget);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          AI Problem Diagnosis & Matching
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
          Smart Problem Matcher
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Select your exact service issue. Our algorithm matches you with tiered technicians calibrated to the job's true technical complexity.
        </p>
      </div>

      {/* Interactive Match Controller */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Issue selector */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Specific Problem / Diagnosis
            </label>
            <select
              value={selectedProblem}
              onChange={(e) => handleProblemChange(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {diagnoses.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-900">
                  {d.title} ({d.category})
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                runMatch(selectedProblem, e.target.value, budget);
              }}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="Mumbai" className="bg-slate-900">Mumbai</option>
              <option value="Bengaluru" className="bg-slate-900">Bengaluru</option>
              <option value="Delhi NCR" className="bg-slate-900">Delhi NCR</option>
              <option value="Pune" className="bg-slate-900">Pune</option>
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>Budget</span>
              <span className="font-mono text-emerald-400">₹{budget}</span>
            </div>
            <input
              type="range"
              min="400"
              max="2500"
              step="100"
              value={budget}
              onChange={(e) => {
                setBudget(Number(e.target.value));
                runMatch(selectedProblem, location, Number(e.target.value));
              }}
              className="w-full mt-3 accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Diagnosis Brief Card */}
      {matchResult?.diagnosis && (
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider block">
                Technical Diagnosis Profile
              </span>
              <h3 className="font-bold text-sm text-white">{matchResult.diagnosis.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{matchResult.diagnosis.typicalIssue}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              Complexity: <strong className="text-amber-400">{matchResult.diagnosis.complexity || 'Standard'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Recommended Professionals Showcase */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Recommended Tiered Professionals
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Calculating multi-factor skill & proximity match...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matchResult?.recommendations?.map((worker, rank) => (
              <div
                key={worker.id}
                className={`glass-card glass-card-hover rounded-3xl p-6 border flex flex-col justify-between space-y-5 relative ${
                  worker.level === 4
                    ? 'border-amber-500/60 shadow-glow'
                    : worker.level === 3
                    ? 'border-purple-500/50 shadow-glow-purple'
                    : 'border-blue-500/40'
                }`}
              >
                {/* Rank Badge */}
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-white shadow">
                  Recommendation #{rank + 1}
                </div>

                <div className="pt-2">
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

                    <SkillScoreMeter
                      score={worker.skillScore}
                      size="sm"
                      workerName={worker.name}
                      breakdownData={worker.scoreComponents}
                    />
                  </div>

                  {/* Why Recommended Badges */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      Why Recommended
                    </span>
                    {worker.recommendationReasons?.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing info */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Standard Pricing:</span>
                    <span className="font-bold font-mono text-white text-sm">
                      ₹{worker.pricing?.basePrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <Link
                    to={`/worker/${worker.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center transition-colors"
                  >
                    View Credentials
                  </Link>
                  <Link
                    to={`/worker/${worker.id}?book=true`}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black text-center shadow transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
