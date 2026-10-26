import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Award,
  Calendar,
  MapPin,
  Lock,
  Share2,
  ExternalLink,
  Printer,
  Sparkles,
  Check,
  ArrowLeft,
  Search,
  FileCheck,
  Building2,
  UserCheck
} from 'lucide-react';

export default function VerificationResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchVerification() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.verification.verifyCredential(id);
        if (isMounted) setResult(data);
      } catch (err) {
        if (isMounted) {
          setError(err.data?.message || err.message || 'Credential record not found.');
          setResult(err.data || { valid: false, status: 'NOT_FOUND' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchVerification();
    return () => { isMounted = false; };
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-14 h-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800 font-display">
          Verifying Credential with National Registry...
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Checking digital certificate cryptographic signature &bull; {id}
        </p>
      </div>
    );
  }

  // STATUS: NOT FOUND
  if (!result || result.status === 'NOT_FOUND') {
    return (
      <div className="min-h-[80vh] py-16 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Registry Check: Not Found
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-display">
              Credential Record Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              No active or historical skill passport exists for identifier{' '}
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                {id}
              </span>.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Possible Reasons:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>The worker has not completed official KaushalID practical assessment.</li>
              <li>The credential identifier was mistyped or entered incorrectly.</li>
              <li>The QR code belongs to an unaccredited third-party certificate.</li>
            </ul>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); if (searchId.trim()) window.location.href = `/verify/${searchId.trim().toUpperCase()}`; }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="e.g. KID-IN-MH-10248"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 px-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              Verify
            </button>
          </form>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // STATUS: REVOKED
  if (result.status === 'REVOKED') {
    return (
      <div className="min-h-[80vh] py-16 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border-2 border-rose-300 shadow-2xl p-8 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center mx-auto text-rose-700">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              Official Registry Status: REVOKED
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-rose-900 font-display">
              Credential Formally Revoked
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              This credential has been permanently revoked by the issuing authority and is no longer valid for employment or verification.
            </p>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex justify-between border-b border-rose-200/80 pb-2">
              <span className="text-slate-500 font-medium">Worker Name:</span>
              <span className="font-bold text-slate-800">{result.workerName}</span>
            </div>
            <div className="flex justify-between border-b border-rose-200/80 pb-2">
              <span className="text-slate-500 font-medium">Trade Specialization:</span>
              <span className="font-bold text-slate-800">{result.trade}</span>
            </div>
            <div className="flex justify-between border-b border-rose-200/80 pb-2">
              <span className="text-slate-500 font-medium">Revoked Date:</span>
              <span className="font-mono text-slate-700">{result.revokedAt?.split('T')[0] || 'Official Audit Record'}</span>
            </div>
            <div className="space-y-1 pt-1">
              <span className="font-bold text-rose-800">Formal Revocation Reason:</span>
              <p className="p-3 bg-white rounded-xl border border-rose-200 text-rose-900 leading-relaxed font-medium">
                {result.revocationReason}
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Registry Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STATUS: EXPIRED
  if (result.status === 'EXPIRED') {
    return (
      <div className="min-h-[80vh] py-16 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border-2 border-amber-300 shadow-2xl p-8 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700">
            <Clock className="w-10 h-10" />
          </div>

          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Registry Status: EXPIRED
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-display">
              Credential Has Expired
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              The 2-year certification validity period for this skill passport has lapsed. A practical re-benchmark assessment is required to renew verified status.
            </p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex justify-between border-b border-amber-200/80 pb-2">
              <span className="text-slate-500 font-medium">Worker Name:</span>
              <span className="font-bold text-slate-800">{result.workerName}</span>
            </div>
            <div className="flex justify-between border-b border-amber-200/80 pb-2">
              <span className="text-slate-500 font-medium">Trade Specialization:</span>
              <span className="font-bold text-slate-800">{result.trade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Lapsed Validity Date:</span>
              <span className="font-mono text-amber-800 font-bold">{result.validUntil || '2025-09-01'}</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Registry Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STATUS: UNDER_REVIEW
  if (result.status === 'UNDER_REVIEW') {
    return (
      <div className="min-h-[80vh] py-16 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-sky-300 shadow-xl p-8 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center mx-auto text-sky-700">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
              Status: Under Review
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Assessment In Evaluation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              The worker has submitted their practical assessment benchmark and evidence. An authorized technical assessor is currently reviewing the documentation.
            </p>
          </div>

          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex justify-between border-b border-sky-200/80 pb-2">
              <span className="text-slate-500 font-medium">Worker Name:</span>
              <span className="font-bold text-slate-800">{result.workerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Trade Specialization:</span>
              <span className="font-bold text-slate-800">{result.trade}</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Registry Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STATUS: VERIFIED (Official Digital Skill Passport View)
  const isMaster = result.tierLevel === 4;
  const verificationUrl = window.location.href;

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-4 sm:px-6 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Actions Header */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Passport</span>
            </button>
          </div>
        </div>

        {/* Verification Certificate Container (A4 Printable) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
          
          {/* Official Registry Header Band */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold font-mono">
                  National Skill Registry of India
                </div>
                <div className="text-sm font-bold text-white font-display">
                  Official Digital Skill Passport &bull; Verified Identity Record
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="text-[11px] font-mono text-emerald-200">
                AUDIT SEAL ID:
              </div>
              <div className="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">
                {result.credentialId}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Worker Profile Overview Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                  {result.workerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900 font-display">
                      {result.workerName}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {result.badge || 'VERIFIED'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">
                    {result.trade} &bull; <span className="font-normal text-slate-500">{result.city}</span>
                  </p>
                  <p className="text-xs font-mono text-slate-500">
                    Passport ID: <span className="font-bold text-slate-800">{result.passportId}</span> &bull; {result.experienceYears} Years Verified Field Experience
                  </p>
                </div>
              </div>

              {/* QR Code Seal for Physical Verification */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 self-stretch sm:self-auto justify-center">
                <div className="p-1 bg-white rounded-xl shadow-xs border border-slate-200">
                  <QRCodeSVG 
                    value={verificationUrl}
                    size={72}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left text-[10px] space-y-0.5 font-mono text-slate-500">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Tamper-Proof
                  </p>
                  <p>Scan to verify</p>
                  <p className="text-emerald-700 font-semibold">2026 Registry</p>
                </div>
              </div>
            </div>

            {/* Official Credentials Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Skill Tier</span>
                <p className="font-bold text-slate-800">{result.tierName || `Level ${result.tierLevel}`}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Benchmark Score</span>
                <p className="font-bold text-emerald-700 text-sm">{result.skillScore}/100 <span className="text-[10px] font-normal text-slate-500">(Top 5%)</span></p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Issue Date</span>
                <p className="font-medium text-slate-700 font-mono">{result.issueDate}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Valid Until</span>
                <p className="font-medium text-slate-700 font-mono">{result.validUntil}</p>
              </div>
            </div>

            {/* Section 1: Practical Verified Competencies */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                  Audited Practical Benchmarks ({result.verifiedCompetencies?.length || 0})
                </h3>
              </div>
              
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold font-mono">
                    <tr>
                      <th className="py-2.5 px-4">Competency Skill Area</th>
                      <th className="py-2.5 px-3">Benchmark Standard</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(result.verifiedCompetencies || []).map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-800">{comp.name}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{comp.standard || 'NSQF Level 5'}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700 font-mono">{comp.score}%</td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Assessor Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Verified Work History */}
            {result.workHistory && result.workHistory.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                    Verified Field Deployments & Projects
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.workHistory.map((w, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{w.project}</span>
                        <span className="text-[10px] font-mono text-slate-500">{w.period}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">Client: {w.client}</p>
                      {w.scope && <p className="text-slate-600 text-[11px] leading-relaxed pt-1">{w.scope}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issuing Authority & Signature Verification */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Issuing Authority:</span> {result.issuingAuthority || 'National Skill Verification Directorate'}
                </p>
                <p className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Authorized Assessor:</span> {result.authorizedAssessor || 'Senior Technical Auditor'}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  Cryptographic Signature: {result.digitalSignatureHash}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified by KaushalID Directorate</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
