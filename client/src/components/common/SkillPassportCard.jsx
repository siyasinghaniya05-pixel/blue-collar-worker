import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
  QrCode
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';

export default function SkillPassportCard({ 
  worker,
  interactive = true,
  onShare,
  showFullDetails = true 
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');

  if (!worker) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-800 font-display">
            Your Skill Passport will be available after verification.
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Complete your practical skill assessment to earn verified competencies on your portable Skill Passport.
          </p>
        </div>
        <div>
          <a
            href="/assessments"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            <span>Request Skill Assessment</span>
          </a>
        </div>
      </div>
    );
  }

  const data = {
    displayName: worker.displayName || worker.name || 'Skilled Craftsman',
    kaushalId: worker.kaushalId || null,
    trade: worker.trade || 'General Tradesperson',
    city: worker.city || 'Not Specified',
    experienceYears: worker.experienceYears || 0,
    verifiedStatus: worker.verifiedStatus || 'not_submitted',
    verificationLevel: worker.verificationLevel || 'Level 1 - Registered',
    verificationDate: worker.verificationDate || 'Pending',
    completionRate: worker.completionRate || 0,
    skills: worker.skills || [],
    certifications: worker.certifications || [],
    workHistory: worker.workHistory || []
  };

  const verificationUrl = data.kaushalId
    ? `${window.location.origin}/passport/${data.kaushalId}`
    : `${window.location.origin}/#for-workers`;

  const handleCopyLink = () => {
    if (!data.kaushalId) return;
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden text-slate-800 transition-all hover:shadow-2xl">
      {/* Top Header Strip: Government-grade Skilltech aesthetic */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold font-mono">
              Digital Skill Passport
            </div>
            <div className="text-[11px] text-emerald-100/80">
              National Verified Skill Identity
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-bold bg-white/15 px-2.5 py-1 rounded-md border border-white/20 tracking-wider">
            {data.kaushalId}
          </span>
        </div>
      </div>

      {/* Main Identity Section */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          {/* Worker Avatar & Badge */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-100 rounded-[14px] flex items-center justify-center text-emerald-800 font-bold text-2xl">
                {data.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'RP'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                {data.displayName}
              </h3>
              <VerificationBadge level={data.verificationLevel} status={data.verifiedStatus} date={data.verificationDate} />
            </div>

            <p className="text-sm font-semibold text-emerald-700">
              {data.trade}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {data.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {data.experienceYears}+ Years Practical Experience
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation if full details */}
        {showFullDetails && (
          <div className="pt-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'skills'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Verified Skills ({data.skills?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('certs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'certs'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Certifications ({data.certifications?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('work')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'work'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Work History
              </button>
            </div>

            {/* Tab 1: Verified Skills */}
            {activeTab === 'skills' && (
              <div className="py-4 space-y-3">
                {data.skills?.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No skills verified yet. Pass a practical assessment to verify trade skills.
                  </div>
                ) : (
                  data.skills.map((skill, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {skill.name}
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          {skill.score}%
                        </span>
                      </div>
                      {/* Score Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Certifications */}
            {activeTab === 'certs' && (
              <div className="py-4 space-y-3">
                {data.certifications?.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No verified certifications added yet.
                  </div>
                ) : (
                  data.certifications.map((cert, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award className="w-4 h-4 text-teal-700" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900">{cert.name}</div>
                        <div className="text-[11px] text-slate-500">Issuer: {cert.issuer} &bull; {cert.issueDate}</div>
                        <div className="text-[10px] font-mono text-emerald-700 mt-0.5">ID: {cert.id}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Work History */}
            {activeTab === 'work' && (
              <div className="py-4 space-y-3">
                {data.workHistory?.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No project history verified yet.
                  </div>
                ) : (
                  data.workHistory.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.project}</div>
                        <div className="text-[11px] text-slate-500">{item.client} &bull; {item.period}</div>
                        {item.scope && (
                          <div className="text-[11px] text-slate-600 mt-1 italic">{item.scope}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* QR Code Verification Section */}
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
              <QRCodeSVG 
                value={verificationUrl} 
                size={76} 
                level="M" 
                fgColor="#0f172a" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                Scan to Verify Identity
              </div>
              <p className="text-[11px] text-slate-500 max-w-[200px] leading-tight mt-0.5">
                Instant cryptographic proof of skills & background.
              </p>
              <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">
                STATUS: VERIFIED ACTIVE
              </div>
            </div>
          </div>

          {/* Interactive Actions */}
          {interactive && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                title="Copy public passport URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={onShare || handleCopyLink}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Passport</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
