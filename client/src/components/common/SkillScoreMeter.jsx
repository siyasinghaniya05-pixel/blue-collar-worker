import React, { useState } from 'react';
import { Info, X, CheckCircle, Award, Clock, ThumbsUp, Wrench, Shield } from 'lucide-react';

export default function SkillScoreMeter({
  score = 85,
  size = 'md',
  showBreakdownModal = true,
  breakdownData = null,
  workerName = 'Worker'
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine color based on score
  let strokeColor = '#10B981'; // Green Basic
  let textColor = 'text-emerald-400';
  let badgeLabel = 'Basic Tier';
  let ringBg = 'from-emerald-500/10 to-transparent';

  if (score >= 90) {
    strokeColor = '#F59E0B'; // Amber Master
    textColor = 'text-amber-400';
    badgeLabel = 'Master Tier';
    ringBg = 'from-amber-500/20 to-amber-500/5';
  } else if (score >= 80) {
    strokeColor = '#8B5CF6'; // Purple Expert
    textColor = 'text-purple-400';
    badgeLabel = 'Expert Tier';
    ringBg = 'from-purple-500/20 to-purple-500/5';
  } else if (score >= 65) {
    strokeColor = '#3B82F6'; // Blue Skilled
    textColor = 'text-blue-400';
    badgeLabel = 'Skilled Tier';
    ringBg = 'from-blue-500/20 to-blue-500/5';
  }

  const dimensions = {
    sm: { width: 56, height: 56, stroke: 4, font: 'text-sm' },
    md: { width: 76, height: 76, stroke: 6, font: 'text-xl' },
    lg: { width: 110, height: 110, stroke: 8, font: 'text-3xl' }
  };

  const dim = dimensions[size] || dimensions.md;
  const radius = (dim.width - dim.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <>
      <div
        onClick={() => showBreakdownModal && setIsOpen(true)}
        className={`relative inline-flex items-center justify-center group cursor-pointer select-none transition-transform active:scale-95 ${ringBg} rounded-full p-1`}
        title="Click to view transparent Skill Score calculation breakdown"
      >
        <svg width={dim.width} height={dim.height} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={dim.width / 2}
            cy={dim.height / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={dim.stroke}
            fill="transparent"
          />
          {/* Progress fill */}
          <circle
            cx={dim.width / 2}
            cy={dim.height / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-display font-extrabold ${dim.font} ${textColor} leading-none tracking-tight`}>
            {score}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] uppercase font-semibold text-slate-400 leading-tight mt-0.5">
              /100
            </span>
          )}
        </div>

        {showBreakdownModal && (
          <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full p-0.5 text-slate-400 group-hover:text-amber-400 group-hover:border-amber-400/50 transition-colors shadow">
            <Info className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Transparent Breakdown Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Transparent Skill Score Engine</h3>
                <p className="text-xs text-slate-400">
                  Calculated using verified benchmarks instead of subjective star ratings
                </p>
              </div>
            </div>

            {/* Score Overview Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Official Score</span>
                <span className="text-3xl font-extrabold font-display text-white">{score} <span className="text-sm font-medium text-slate-500">/ 100</span></span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Worker Tier</span>
                <span className={`text-base font-bold ${textColor}`}>{badgeLabel}</span>
              </div>
            </div>

            {/* Formula Breakdown */}
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">
              Weighted Component Breakdown
            </h4>

            <div className="space-y-3 mb-6">
              {/* 1. Practical Test */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Practical Assessment Test</div>
                    <div className="text-xs text-slate-400">Rigorous domain test & fault diagnosis</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {breakdownData?.practicalTest?.points || Math.round(score * 0.40)} pts
                  </div>
                  <div className="text-[11px] text-blue-400 font-semibold">40% Weight</div>
                </div>
              </div>

              {/* 2. Verified Experience */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Verified Experience</div>
                    <div className="text-xs text-slate-400">Audited service history & background logs</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {breakdownData?.verifiedExperience?.points || Math.round(score * 0.20)} pts
                  </div>
                  <div className="text-[11px] text-purple-400 font-semibold">20% Weight</div>
                </div>
              </div>

              {/* 3. Job Success Rate */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Verified Job Success Rate</div>
                    <div className="text-xs text-slate-400">Confirmed job completions without dispute</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {breakdownData?.jobSuccessRate?.points || Math.round(score * 0.15)} pts
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">15% Weight</div>
                </div>
              </div>

              {/* 4. Customer Performance Score */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Customer Performance Score</div>
                    <div className="text-xs text-slate-400">5-dimension technical review average</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {breakdownData?.customerFeedback?.points || Math.round(score * 0.10)} pts
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">10% Weight</div>
                </div>
              </div>

              {/* 5. Industry Certifications */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Industry Certifications</div>
                    <div className="text-xs text-slate-400">Accredited ITI, NCVT, or manufacturer licenses</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {breakdownData?.certifications?.points || Math.round(score * 0.10)} pts
                  </div>
                  <div className="text-[11px] text-cyan-400 font-semibold">10% Weight</div>
                </div>
              </div>

              {/* 6. Reliability / Punctuality */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Reliability & On-Time Arrival</div>
                    <div className="text-xs text-slate-400">Punctual arrival track record</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {breakdownData?.reliability?.points || Math.round(score * 0.05)} pts
                  </div>
                  <div className="text-[11px] text-pink-400 font-semibold">5% Weight</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
              <span className="text-amber-300 font-medium">Why this matters:</span> Unlike conventional portals where 5-star ratings can be influenced by discounts or casual politeness, SkillServe scores reflect verified technical competence and tested real-world capability.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
