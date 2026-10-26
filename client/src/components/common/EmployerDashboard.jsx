import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import VerificationBadge from './VerificationBadge';
import { 
  Building2, 
  Search, 
  QrCode, 
  Bookmark, 
  CheckCircle2, 
  Filter, 
  ShieldCheck, 
  ExternalLink,
  Award,
  MapPin,
  Briefcase,
  Sparkles,
  CreditCard,
  UserCheck,
  Check,
  AlertCircle,
  X
} from 'lucide-react';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'scanner' | 'saved' | 'subscription'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [verifyIdInput, setVerifyIdInput] = useState('');

  const [workersList, setWorkersList] = useState([]);
  const [savedWorkerIds, setSavedWorkerIds] = useState([]);
  const [subscription, setSubscription] = useState({
    status: 'Active',
    plan: 'Monthly Enterprise',
    price: 999,
    verificationCredits: 50
  });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);

  // Load live employer profile and workers
  const loadData = async () => {
    try {
      const [workersRes, empProfile] = await Promise.all([
        api.workers.list({
          query: searchQuery || undefined,
          category: selectedTrade !== 'All' ? selectedTrade : undefined,
          city: selectedCity !== 'All' ? selectedCity : undefined
        }),
        api.employer.getProfile().catch(() => null)
      ]);

      if (workersRes?.workers) {
        setWorkersList(workersRes.workers);
      }
      if (empProfile) {
        if (Array.isArray(empProfile.savedWorkers)) {
          setSavedWorkerIds(empProfile.savedWorkers);
        }
        if (empProfile.subscription) {
          setSubscription(empProfile.subscription);
        }
      }
    } catch (err) {
      console.error('Failed to load employer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedTrade, selectedCity]);

  // Toggle bookmark with backend persistence
  const toggleSaveWorker = async (workerId) => {
    setSavingId(workerId);
    try {
      const res = await api.employer.saveWorker(workerId);
      setSavedWorkerIds(res.savedWorkers || []);
      setBannerMessage(res.message);
      setTimeout(() => setBannerMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update bookmark');
    } finally {
      setSavingId(null);
    }
  };

  // Sandbox Subscription Checkout
  const handleSandboxSubscribe = async () => {
    setCheckoutLoading(true);
    try {
      const res = await api.employer.subscribe({ plan: 'Enterprise Monthly' });
      setSubscription(res.subscription);
      setCheckoutModalOpen(false);
      setBannerMessage('Enterprise Subscription activated (Sandbox Mode). 50 verification credits added.');
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err) {
      alert(err.message || 'Subscription failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManualVerifySubmit = (e) => {
    e.preventDefault();
    if (!verifyIdInput.trim()) return;
    const cleanId = verifyIdInput.trim().toUpperCase();
    navigate(`/verify/${cleanId}`);
  };

  const savedWorkers = workersList.filter(w => 
    savedWorkerIds.includes(w.id) || savedWorkerIds.includes(w.kaushalId)
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Employer Brand Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Employer & Contractor Portal
              </span>
              <span className="text-xs font-mono text-slate-500">
                {user?.companyId || 'EMP-IN-MH-4421'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {user?.companyName || 'L&T Infrastructure MEP Division'}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Discover verified technicians, bookmark vetted candidate profiles, and scan tamper-proof Skill Passports across your project sites.
            </p>
          </div>

          {/* Subscription & Credits Status Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-emerald-900 font-mono">Subscription Status</span>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                  {subscription.status || 'Active'}
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5 font-display">
                {subscription.verificationCredits ?? 50} <span className="text-xs font-normal text-slate-600">Verification Credits</span>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="text-[11px] text-emerald-700 font-bold hover:underline"
              >
                Renew Plan (₹999/mo Sandbox) &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Action Banner */}
        {bannerMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{bannerMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'search'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Discover Workers ({workersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Candidates ({savedWorkerIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'scanner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Direct QR Lookup</span>
          </button>
        </div>

        {/* TAB 1: WORKER DISCOVERY & SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            
            {/* Filter Controls Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by worker name, KaushalID, trade, or skill keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              {/* Trade Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold text-slate-700"
                >
                  <option value="All">All Trades</option>
                  <option value="Electrician">Electricians</option>
                  <option value="AC Technician">AC & HVAC</option>
                  <option value="Plumber">Plumbers</option>
                  <option value="Carpenter">Carpenters</option>
                  <option value="Painter">Painters</option>
                  <option value="Welder">Welders</option>
                </select>

                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold text-slate-700"
                >
                  <option value="All">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

            </div>

            {/* Workers Grid */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Loading verified candidates from registry...
              </div>
            ) : workersList.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No workers found. Try changing your filters.</h3>
                <p className="text-xs text-slate-500">Try clearing the trade or city filters to view all accredited technicians.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workersList.map((worker) => {
                  const workerId = worker.kaushalId || worker.id;
                  const isSaved = savedWorkerIds.includes(worker.id) || savedWorkerIds.includes(worker.kaushalId);

                  return (
                    <div
                      key={worker.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between p-6 space-y-5"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                              {worker.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base font-display">
                                {worker.name}
                              </h3>
                              <p className="text-xs font-semibold text-emerald-700">
                                {worker.specialty || worker.occupation}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400">
                                {workerId}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleSaveWorker(workerId)}
                            disabled={savingId === workerId}
                            className={`p-2 rounded-xl border transition ${
                              isSaved
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                            }`}
                            title={isSaved ? 'Remove from saved' : 'Save candidate'}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 font-mono">
                          <span className="text-slate-500">{worker.city}</span>
                          <span className="font-bold text-emerald-800">
                            Score: {worker.skillScore || 85}/100
                          </span>
                          <span className="font-bold text-slate-700">
                            {worker.experienceYears || 5} yrs exp
                          </span>
                        </div>

                        {/* Top Skills Badges */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Verified Competencies:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(worker.skillBreakdown || worker.skills || []).slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-lg"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/verify/${workerId}`}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>View Passport</span>
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: SAVED CANDIDATES */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">
                  Saved Candidate Shortlist ({savedWorkers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Workers bookmarked for current MEP projects and site deployments.
                </p>
              </div>
            </div>

            {savedWorkers.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No candidates shortlisted yet</h3>
                <p className="text-xs text-slate-500">Click the bookmark icon on any worker card to save them to this list.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedWorkers.map((worker) => (
                  <div key={worker.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">
                          {worker.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm font-display">{worker.name}</h4>
                          <p className="text-xs text-emerald-700">{worker.specialty}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaveWorker(worker.kaushalId || worker.id)}
                        className="text-amber-600 hover:text-slate-400 p-1"
                        title="Remove bookmark"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                      <span>{worker.city}</span>
                      <span className="font-bold text-slate-800">{worker.kaushalId || worker.id}</span>
                    </div>

                    <Link
                      to={`/verify/${worker.kaushalId || worker.id}`}
                      className="block w-full py-2 bg-slate-900 text-white rounded-xl text-center text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Inspect Digital Passport &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QR SCANNER & MANUAL LOOKUP */}
        {activeTab === 'scanner' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <QrCode className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 font-display">
                On-Site Worker QR Verification
              </h3>
              <p className="text-xs text-slate-600">
                Enter the worker's physical Skill Passport ID or scan their digital credential card to verify competency records.
              </p>
            </div>

            <form onSubmit={handleManualVerifySubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Enter KaushalID (e.g. KID-IN-MH-10248)"
                value={verifyIdInput}
                onChange={(e) => setVerifyIdInput(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-center uppercase"
              />

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition"
              >
                Validate Official Credential
              </button>
            </form>

            <div className="text-[11px] text-slate-400 font-mono">
              Direct verification queries check the National Skill Registry in real time.
            </div>
          </div>
        )}

      </div>

      {/* Sandbox Subscription Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-slate-900 text-base font-display flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Employer Enterprise Subscription
              </h4>
              <button onClick={() => setCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-emerald-900 font-bold text-sm">
                  <span>Monthly Enterprise Plan</span>
                  <span>₹999 / month</span>
                </div>
                <ul className="text-emerald-800 space-y-1 list-disc list-inside">
                  <li>Full candidate discovery & search across all trades</li>
                  <li>50 automated verified credential checks per month</li>
                  <li>Persistent shortlisting & candidate bookmarking</li>
                  <li>On-site QR verification audit records</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] space-y-1">
                <p className="font-semibold text-slate-700">Sandbox Checkout Mode</p>
                <p>This development environment simulates instantaneous payment confirmation via test gateway. No real charges are made.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSandboxSubscribe}
                disabled={checkoutLoading}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
              >
                {checkoutLoading ? 'Processing...' : 'Confirm Sandbox Plan (₹999)'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
