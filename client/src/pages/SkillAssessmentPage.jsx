import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Upload,
  Check
} from 'lucide-react';

const TRADE_SKILLS = {
  'Electrician': [
    { id: 'elec-1', name: 'Three-Phase Industrial Wiring & Distribution', benchmark: 'NSQF Level 5 • Tripping curve testing, 3-phase load balance, busbar insulation' },
    { id: 'elec-2', name: 'MCB & Substation Installation', benchmark: 'NSQF Level 5 • Short circuit withstand test, earth pit resistance < 1.0 Ohm' },
    { id: 'elec-3', name: 'Multimeter & Diagnostic Fault Troubleshooting', benchmark: 'NSQF Level 4 • Megger insulation check, phase-to-ground fault localization' },
    { id: 'elec-4', name: 'Solar Inverter Synchronization & Relays', benchmark: 'NSQF Level 4 • Anti-islanding verification, grid synchronization under 20ms' }
  ],
  'AC Technician': [
    { id: 'hvac-1', name: 'VRV / VRF Diagnostics & Commissioning', benchmark: 'NSQF Level 4 • Electronic expansion valve calibration, multi-split pipe flare checks' },
    { id: 'hvac-2', name: 'Chiller Compressor Overhaul & Oil Flushing', benchmark: 'NSQF Level 5 • Scroll compressor tear-down, vacuum hold at 500 microns' },
    { id: 'hvac-3', name: 'R-32 Refrigerant Safe Recovery & Charging', benchmark: 'NSQF Level 4 • Digital scale weight charging, flammability safety checklist' }
  ],
  'Plumber': [
    { id: 'plumb-1', name: 'Hydraulic Multi-Storey Pressure Testing', benchmark: 'NSQF Level 4 • 10-bar hydrostatic pressure test, zero drop over 4-hour window' },
    { id: 'plumb-2', name: 'CPVC Industrial Fitting & Solvent Welds', benchmark: 'NSQF Level 3 • Laser slope alignment, expansion loop thermal tolerance' },
    { id: 'plumb-3', name: 'Submersible Booster Pump Motor Overhaul', benchmark: 'NSQF Level 4 • Mechanical seal replacement, impeller balancing' }
  ],
  'Welder': [
    { id: 'weld-1', name: 'TIG Stainless Steel 6G Pipe Position', benchmark: 'ISO 9606 Aligned • 100% root penetration, radiographically clear coupon' },
    { id: 'weld-2', name: 'Structural Arc Multi-Pass Fillet Weld', benchmark: 'AWS D1.1 Aligned • Zero undercut, slag inclusion absence under dye penetrant' }
  ]
};

export default function SkillAssessmentPage() {
  const { user } = useAuth();
  const [selectedTrade, setSelectedTrade] = useState('Electrician');
  const [selectedSkill, setSelectedSkill] = useState(TRADE_SKILLS['Electrician'][0].name);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  const loadRequests = async () => {
    try {
      const data = await api.assessments.getRequests();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleTradeChange = (trade) => {
    setSelectedTrade(trade);
    if (TRADE_SKILLS[trade] && TRADE_SKILLS[trade][0]) {
      setSelectedSkill(TRADE_SKILLS[trade][0].name);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!evidenceDescription.trim()) {
      alert('Please describe your practical work evidence or workbench experience.');
      return;
    }
    setSubmitting(true);
    try {
      await api.assessments.createRequest({
        trade: selectedTrade,
        skillArea: selectedSkill,
        evidenceDescription
      });
      setEvidenceDescription('');
      setSuccessBanner('Assessment request submitted! Queued for Authorized Technical Assessor review.');
      setTimeout(() => setSuccessBanner(null), 5000);
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Failed to submit assessment request');
    } finally {
      setSubmitting(false);
    }
  };

  const activeSkillsList = TRADE_SKILLS[selectedTrade] || TRADE_SKILLS['Electrician'];
  const activeBenchmark = activeSkillsList.find(s => s.name === selectedSkill)?.benchmark;

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>National Practical Benchmark Assessments</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
              Practical Skill Verification
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Request domain-specific practical benchmarks with authorized technical assessors to elevate your digital Skill Passport tier.
            </p>
          </div>

          <Link
            to="/worker-dashboard"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Feedback Alert */}
        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Request Assessment */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-display">
                Request a Practical Assessment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated by authorized assessors under NSQF standards.
              </p>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-5">
              
              {/* Select Trade */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">1. Select Occupation</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(TRADE_SKILLS).map((trade) => (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => handleTradeChange(trade)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        selectedTrade === trade
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {trade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Skill Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">2. Skill Area to Verify</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {activeSkillsList.map((skill) => (
                    <option key={skill.id} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Benchmark Criteria Preview */}
              {activeBenchmark && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Assessment Criteria:
                  </span>
                  <p className="text-emerald-800 leading-relaxed font-medium">
                    {activeBenchmark}
                  </p>
                </div>
              )}

              {/* Work Evidence Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  3. Practical Evidence & Field Test Record
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your practical workbench experience, tools calibrated, test instruments used, or project reference (e.g. Megger insulation test log, 63A distribution board setup, hydrostatic pump certificate)..."
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Fee & Sandbox Checkout Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">Practical Assessment & Verification Fee:</span>
                  <span className="font-bold text-slate-900 text-sm">₹499</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Audit Authority:</span>
                  <span className="font-semibold text-emerald-700">National Directorate Assessor</span>
                </div>
                <div className="text-[10px] bg-white p-2 rounded-lg border border-slate-200 text-slate-400 font-mono flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-600" />
                  Development Sandbox Mode: Instant mock checkout simulation (No charges incurred)
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting to Assessor Queue...' : 'Submit Assessment Request (₹499)'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Active Assessment History */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                  My Assessment History
                </h3>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {requests.length} Requests
                </span>
              </div>

              {loading ? (
                <p className="text-xs text-slate-400 text-center py-4">Loading assessment records...</p>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 space-y-2 text-slate-400">
                  <Award className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">You haven't requested an assessment yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((reqItem) => {
                    const isApproved = reqItem.status === 'Approved';
                    const isRejected = reqItem.status === 'Rejected';
                    return (
                      <div
                        key={reqItem.id}
                        className={`p-4 rounded-2xl border text-xs space-y-2 transition ${
                          isApproved ? 'bg-emerald-50/40 border-emerald-200' :
                          (isRejected ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200')
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{reqItem.skillArea}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved ? 'bg-emerald-100 text-emerald-800' :
                            (isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')
                          }`}>
                            {reqItem.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {reqItem.evidenceDescription}
                        </p>

                        {isApproved && (
                          <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-medium space-y-0.5">
                            <p className="font-bold">Passed with Score: {reqItem.score}%</p>
                            {reqItem.assessorNotes && <p className="text-emerald-700 italic">"{reqItem.assessorNotes}"</p>}
                          </div>
                        )}

                        {isRejected && reqItem.rejectionReason && (
                          <div className="pt-2 border-t border-rose-200/60 text-[11px] text-rose-800 space-y-0.5">
                            <span className="font-bold">Rejection Feedback:</span>
                            <p className="text-rose-900 bg-white p-2 rounded-lg border border-rose-200">
                              {reqItem.rejectionReason}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                          <span>{reqItem.id}</span>
                          <span>{reqItem.submittedAt?.split('T')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* How It Works Guide Box */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 rounded-3xl space-y-4 shadow-md">
              <h4 className="text-sm font-bold uppercase tracking-wider font-display text-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                The KaushalID 4-Tier Elevation
              </h4>
              <ul className="text-xs space-y-2.5 text-emerald-100/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">Level 1 (Basic):</span> Self-reported profile + identity verification.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">Level 2 (Skilled):</span> Practical benchmark test passed (&gt;75%).
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">Level 3 (Expert):</span> Advanced diagnostic test + verified work history (&gt;80%).
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">Level 4 (Master):</span> Top 5% practical score (&gt;92%) + recognized certifications.
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
