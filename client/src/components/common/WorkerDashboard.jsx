import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SkillPassportCard from './SkillPassportCard';
import VerificationBadge from './VerificationBadge';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  Plus, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Load worker data from authenticated user only (NO hardcoded fake profile)
  const isVerified = user?.verifiedStatus === 'verified' && Boolean(user?.kaushalId);
  const worker = {
    displayName: user?.displayName || user?.name || 'Skilled Craftsman',
    kaushalId: user?.kaushalId || null,
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || 'Not Specified',
    trade: user?.trade || 'General Tradesperson',
    experienceYears: user?.experienceYears || 0,
    verifiedStatus: user?.verifiedStatus || 'not_submitted',
    verificationLevel: user?.verificationLevel || 'Level 1 - Registered',
    verificationDate: user?.verificationDate || null,
    completionRate: user?.completionRate || (user?.trade && user?.city ? 50 : 25),
    skills: user?.skills || [],
    certifications: user?.certifications || [],
    workHistory: user?.workHistory || []
  };

  const passportUrl = worker.kaushalId 
    ? `${window.location.origin}/verify/${worker.kaushalId}` 
    : '';

  const handleCopyLink = () => {
    if (!passportUrl) return;
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Welcome Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Worker Portal
              </span>
              {worker.kaushalId && (
                <span className="text-xs font-mono text-slate-500">ID: {worker.kaushalId}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Welcome back, {worker.displayName}! 👋
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              {isVerified
                ? 'Your portable Skill Passport is active and cryptographically verified. Employers and customers can verify your credentials instantly via QR.'
                : 'Complete your profile to get started. Request a practical assessment to verify your skills and receive your digital Skill Passport.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/assessments"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Request Skill Assessment</span>
            </Link>
            {isVerified && (
              <>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Passport</span>
                </button>
                <Link
                  to={`/verify/${worker.kaushalId}`}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>View Public Passport</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Profile Completion Progress */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Profile Completion
                </span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  {worker.completionRate}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${worker.completionRate}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Add 1 more client verification to unlock 100% Elite status badge.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High visibility to employers
              </span>
              <Link to="/profile" className="text-slate-600 hover:text-slate-900 font-bold">Edit</Link>
            </div>
          </div>

          {/* Card 2: Verification Status */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">
                Verification Status
              </div>
              <div className="flex items-center gap-2 mb-2">
                <VerificationBadge level={worker.verificationLevel} status={worker.verifiedStatus} size="lg" />
              </div>
              <p className="text-xs text-slate-500">
                Verified on {worker.verificationDate} via Kaushal Practical Examination.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500">Tamper-Evident SHA-256</span>
              <span className="text-emerald-700 font-bold">Active</span>
            </div>
          </div>

          {/* Card 3: Instant QR Quick Access */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Quick QR Access
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Display this code on-site for immediate client verification.
              </p>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Link Copied' : 'Copy Passport URL'}</span>
              </button>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex-shrink-0">
              <QrCode className="w-14 h-14 text-slate-800" />
            </div>
          </div>

        </div>

        {/* Main Content Layout: Left Details, Right Digital Passport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Skills, Certifications, Work History */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Verified Skills Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    Verified Technical Skills ({worker.skills.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Assessed against national practical trade competency benchmarks
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  Audit Passed
                </span>
              </div>

              {worker.skills.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">You haven't requested an assessment yet.</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Complete your practical skill assessment to earn verified competencies on your portable Skill Passport.
                    </p>
                  </div>
                  <Link
                    to="/assessments"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Request Assessment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {worker.skills.map((skill, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="font-bold text-slate-800 text-sm">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {skill.level}
                          </span>
                          <span className="font-mono font-bold text-emerald-700 text-sm">
                            {skill.score}%
                          </span>
                        </div>
                      </div>
                      {/* Score Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    Verified Certifications ({worker.certifications.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Accredited trade licenses and government recognized diplomas
                  </p>
                </div>
              </div>

              {worker.certifications.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No certifications on record yet</h4>
                  <p className="text-xs text-slate-500">
                    Accredited trade licenses (ITI, PWD, NSQF) will appear here once verified.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {worker.certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award className="w-5 h-5 text-teal-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{cert.name}</h4>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            VERIFIED
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Issuing Authority: <span className="font-medium text-slate-700">{cert.issuer}</span> &bull; {cert.issueDate}
                        </p>
                        <p className="text-[11px] font-mono text-emerald-700 mt-1 font-semibold">
                          Credential ID: {cert.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Work History Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    Verified Work Experience ({worker.workHistory.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Industrial, commercial and residential milestones
                  </p>
                </div>
              </div>

              {worker.workHistory.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No work history recorded yet</h4>
                  <p className="text-xs text-slate-500">
                    Verified commercial, industrial, or residential projects will be listed here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {worker.workHistory.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{item.project}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Client: <span className="font-semibold text-slate-700">{item.client}</span> &bull; Period: {item.period}
                        </p>
                        {item.scope && (
                          <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-xl border border-slate-200 italic">
                            "{item.scope}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (5 cols): Skill Passport Visual Preview & Actions */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Digital Skill Passport Card
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isVerified ? 'Live Verified' : 'Pending Verification'}
                </span>
              </div>

              {/* Passport Card Component or Empty State */}
              {isVerified ? (
                <SkillPassportCard
                  worker={worker}
                  interactive={true}
                  onShare={() => setShareModalOpen(true)}
                  showFullDetails={false}
                />
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 font-display">
                      Your Skill Passport will be available after verification.
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Once an authorized assessor evaluates your practical trade benchmark, your cryptographic KaushalID and live QR code will be generated here.
                    </p>
                  </div>
                  <Link
                    to="/assessments"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Award className="w-4 h-4" />
                    <span>Request Assessment (₹499)</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Share Passport Dialog Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 font-display mb-1">
              Share Your Skill Passport
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Anyone with this link or QR code can instantly verify your skills, certifications, and work history.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-mono">
                  Direct Verification Link
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                  <input
                    type="text"
                    readOnly
                    value={passportUrl}
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex-shrink-0 transition"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
