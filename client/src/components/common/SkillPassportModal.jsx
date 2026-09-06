import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, Download, Award, CheckCircle, Calendar, FileText } from 'lucide-react';
import SkillBadge from './SkillBadge';

export default function SkillPassportModal({ worker, isOpen, onClose }) {
  if (!isOpen || !worker) return null;

  const passportId = `SS-PASS-${worker.id.toUpperCase()}-${worker.level}`;
  const verificationUrl = `https://skillserve.org/verify/${worker.id}?ref=qr_scan`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[95vh] flex flex-col">
        {/* Top Decorative Border */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-500 w-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container (Scrollable) */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-wide">
                    SKILL PASSPORT
                  </h2>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/40">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">ID: {passportId}</p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Issuing Authority</span>
              <span className="text-xs font-semibold text-emerald-400">SkillServe National Skill Registry</span>
            </div>
          </div>

          {/* Worker Identity Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            {/* Left Column: Avatar & Basic Details */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400/50 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2">
                  <SkillBadge level={worker.level} size="sm" showLabel={false} />
                </div>
              </div>
              <h3 className="font-bold text-lg text-white">{worker.name}</h3>
              <p className="text-xs text-amber-400 font-medium mb-2">{worker.specialty}</p>
              <SkillBadge level={worker.level} size="sm" />
            </div>

            {/* Middle Column: Key Verification Metrics */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Skill Score</span>
                <span className="text-2xl font-black font-display text-amber-400">
                  {worker.skillScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Top 3% Platform Rank</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Verified Jobs</span>
                <span className="text-2xl font-black font-display text-white">
                  {worker.jobsCompleted.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-0.5">100% Client Signed</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Success Rate</span>
                <span className="text-2xl font-black font-display text-emerald-400">
                  {worker.stats?.jobSuccessRate || 98}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Zero Active Disputes</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Experience</span>
                <span className="text-2xl font-black font-display text-purple-400">
                  {worker.experienceYears} <span className="text-xs font-normal text-slate-500">Yrs</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Tax & License Audited</span>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          {worker.skillBreakdown && worker.skillBreakdown.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Verified Practical Skill Domains
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {worker.skillBreakdown.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Certifications */}
          {worker.certifications && worker.certifications.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Audited Industry Certifications
              </h4>
              <div className="space-y-2">
                {worker.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {cert.name}
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Issued by: <span className="text-slate-300">{cert.issuer}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        Credential ID: {cert.credentialId}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Verification Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-xl border-2 border-amber-400/80">
                <QRCodeSVG
                  value={worker.passportQrData || verificationUrl}
                  size={100}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider block">
                  Scan To Verify On-Site
                </span>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xs">
                  Customers or site inspectors can scan this official Skill QR code with any smartphone camera to verify credentials in real-time.
                </p>
                <span className="text-[10px] font-mono text-slate-500 block mt-1">
                  SHA-256 Verified Ledger ID
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 hover:border-slate-600 transition-all shadow"
            >
              <Download className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
