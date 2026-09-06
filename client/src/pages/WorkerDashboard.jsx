import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  Calendar,
  DollarSign,
  Star,
  ArrowRight,
  Sparkles,
  AlertCircle,
  PlusCircle,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/common/SkillBadge';
import SkillScoreMeter from '../components/common/SkillScoreMeter';
import SkillPassportModal from '../components/common/SkillPassportModal';

export default function WorkerDashboard() {
  const { user, workerProfile, refreshWorkerProfile } = useAuth();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passportOpen, setPassportOpen] = useState(false);

  // Pricing Form State
  const [newPrice, setNewPrice] = useState('');
  const [pricingMsg, setPricingMsg] = useState(null);
  const [updatingPrice, setUpdatingPrice] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const workerId = workerProfile?.id || 'w-1';
        const [workerRes, bookingRes] = await Promise.all([
          fetch(`/api/workers/${workerId}`),
          fetch(`/api/bookings?workerId=${workerId}`)
        ]);

        if (workerRes.ok) {
          const wData = await workerRes.json();
          setWorker(wData);
          setNewPrice(wData.pricing?.basePrice || 1199);
        }

        if (bookingRes.ok) {
          const bData = await bookingRes.json();
          setBookings(bData);
        }
      } catch (err) {
        console.error('Failed to load worker dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [workerProfile]);

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setUpdatingPrice(true);
    setPricingMsg(null);
    try {
      const res = await fetch(`/api/workers/${worker.id}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrice: Number(newPrice) })
      });
      const data = await res.json();
      if (res.ok) {
        setPricingMsg({ type: 'success', text: 'Fair pricing updated and approved within tier guidelines.' });
        refreshWorkerProfile(worker.id);
      } else {
        setPricingMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setPricingMsg({ type: 'error', text: err.message });
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh bookings
        const updated = await fetch(`/api/bookings?workerId=${worker.id}`).then(r => r.json());
        setBookings(updated);
      }
    } catch (err) {
      console.error('Failed to update booking status', err);
    }
  };

  if (loading || !worker) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading Worker Credential Console & Realtime Analytics...</p>
      </div>
    );
  }

  // Calculate earnings (mock based on completed jobs)
  const totalEarnings = (worker.jobsCompleted * (worker.pricing?.basePrice || 1199) * 0.85);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={worker.avatar}
            alt={worker.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-extrabold text-2xl text-white">{worker.name}</h1>
              <SkillBadge level={worker.level} size="md" />
            </div>
            <p className="text-xs text-amber-300 font-medium">{worker.specialty} • {worker.city}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Identity & Practical Diagnostic Credentials Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setPassportOpen(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 shadow"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            Digital Skill Passport
          </button>
          <Link
            to="/assessment"
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Retake Practical Exam
          </Link>
        </div>
      </div>

      {/* 2. Real-time KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Skill Score</span>
          <span className="text-2xl font-black font-display text-amber-400">{worker.skillScore}</span>
          <span className="text-[10px] text-slate-500 block">/ 100 benchmark</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Current Tier</span>
          <span className="text-base font-bold text-white block mt-1">{worker.tierName}</span>
          <span className="text-[10px] text-emerald-400 font-semibold block">Level {worker.level}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Est. Net Earnings</span>
          <span className="text-xl font-black font-display text-emerald-400">₹{(totalEarnings / 100000).toFixed(1)}L</span>
          <span className="text-[10px] text-slate-500 block">85% fair share</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Verified Jobs</span>
          <span className="text-2xl font-black font-display text-white">{worker.jobsCompleted}</span>
          <span className="text-[10px] text-slate-500 block">All client signed</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Success Rate</span>
          <span className="text-2xl font-black font-display text-emerald-400">{worker.stats?.jobSuccessRate}%</span>
          <span className="text-[10px] text-slate-500 block">Zero disputes</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">On-Time Arrival</span>
          <span className="text-2xl font-black font-display text-purple-400">{worker.stats?.onTimeRate}%</span>
          <span className="text-[10px] text-slate-500 block">GPS verified</span>
        </div>
      </div>

      {/* 3. Actionable "Improve Your Skill Score" & Level Up Roadmap */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-500/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Improve Your Skill Score & Advance Tier</h2>
            <p className="text-xs text-slate-300">
              Follow these verified milestones to increase your composite score from {worker.skillScore} to unlock higher tier pricing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-400">+4 Skill Points</span>
                <span className="text-[10px] text-slate-500">Practical Test</span>
              </div>
              <h4 className="font-bold text-sm text-white">Advanced Diagnostic Assessment</h4>
              <p className="text-xs text-slate-400 mt-1">
                Score above 95% on high-voltage circuit fault isolation and safety protocols.
              </p>
            </div>
            <Link
              to="/assessment"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-2"
            >
              Start Assessment <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-purple-400">+3 Skill Points</span>
                <span className="text-[10px] text-slate-500">Industry Credential</span>
              </div>
              <h4 className="font-bold text-sm text-white">Upload Accredited Certificate</h4>
              <p className="text-xs text-slate-400 mt-1">
                Submit an accredited Schneider Electric or NCVT solar/industrial automation license.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 mt-2">
              National Registry Verification
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-400">+2 Skill Points</span>
                <span className="text-[10px] text-slate-500">Punctuality</span>
              </div>
              <h4 className="font-bold text-sm text-white">Complete 10 Consecutive On-Time Jobs</h4>
              <p className="text-xs text-slate-400 mt-1">
                Maintain 100% on-time GPS check-ins for the next 10 booked customer slots.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 mt-2">
              Current streak: 8/10
            </span>
          </div>
        </div>
      </div>

      {/* 4. Active Bookings Manager & Fair Pay Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Active & Upcoming Bookings ({bookings.length})
            </h2>
            <span className="text-xs text-slate-400">Live Stage Tracker Sync</span>
          </div>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                No active bookings currently scheduled.
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 block">
                        {booking.bookingNumber}
                      </span>
                      <h3 className="font-bold text-sm text-white">{booking.serviceTitle}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Client: <strong className="text-slate-200">{booking.customerName}</strong> • {booking.scheduledDate} ({booking.scheduledTimeSlot})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 border border-amber-500/40 text-amber-300">
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Address:</span> {booking.address}
                  </div>

                  {/* Booking Stage Update Buttons for Worker */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 mr-2">Update Stage:</span>

                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'On The Way')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                      >
                        Mark 'On The Way'
                      </button>
                    )}

                    {booking.status === 'On The Way' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'Job Started')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
                      >
                        Mark 'Job Started'
                      </button>
                    )}

                    {booking.status === 'Job Started' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'Job Completed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
                      >
                        Mark 'Job Completed'
                      </button>
                    )}

                    <Link
                      to={`/bookings?id=${booking.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold ml-auto"
                    >
                      View Live Tracker
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Fair Pay Pricing Controller */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Fair Pay Policy
              </span>
              <h3 className="font-display font-bold text-base text-white">
                Skill-Based Pricing Control
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You are permitted to define rates above platform floor for Level {worker.level} ({worker.tierName}).
              </p>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Base Service Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Minimum platform approved rate for {worker.tierName}: <strong>₹{worker.level === 4 ? '1,199' : worker.level === 3 ? '799' : worker.level === 2 ? '499' : '299'}</strong>
                </span>
              </div>

              {pricingMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                  pricingMsg.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/80 text-red-300 border border-red-500/40'
                }`}>
                  {pricingMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={updatingPrice}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {updatingPrice ? 'Validating Policy...' : 'Save & Update Fair Pricing'}
              </button>
            </form>
          </div>

          {/* Verified Experience Timeline */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Verified Experience Timeline
            </h3>

            <div className="space-y-4 border-l-2 border-slate-800 ml-2 pl-4">
              {worker.experienceTimeline?.map((item, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                  <span className="text-[10px] font-mono font-bold text-amber-400">{item.year}</span>
                  <h4 className="text-xs font-bold text-white">{item.role} • {item.org}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Passport Modal */}
      <SkillPassportModal
        worker={worker}
        isOpen={passportOpen}
        onClose={() => setPassportOpen(false)}
      />
    </div>
  );
}
