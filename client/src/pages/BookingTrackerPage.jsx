import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Award,
  AlertCircle,
  Star,
  FileCheck,
  QrCode,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/common/SkillBadge';
import confetti from 'canvas-confetti';

const TRACKING_STAGES = [
  'Confirmed',
  'Worker Assigned',
  'On The Way',
  'Job Started',
  'Job Completed'
];

export default function BookingTrackerPage() {
  const [searchParams] = useSearchParams();
  const selectedBookingId = searchParams.get('id');
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    technicalQuality: 5,
    professionalism: 5,
    punctuality: 5,
    valueForMoney: 5,
    communication: 5,
    comment: ''
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
          if (data.length > 0) {
            const found = selectedBookingId ? data.find(b => b.id === selectedBookingId) : data[0];
            setActiveBooking(found || data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load bookings', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [selectedBookingId]);

  // Advance tracking stage for interactive testing
  const advanceStage = async (nextStatus) => {
    if (!activeBooking) return;
    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBooking(data.booking);
        setBookings(bookings.map(b => b.id === data.booking.id ? data.booking : b));
      }
    } catch (err) {
      console.error('Failed to advance stage', err);
    }
  };

  // Customer verifies job completion
  const verifyCompletion = async () => {
    if (!activeBooking) return;
    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}/verify-completion`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBooking(data.booking);
        setBookings(bookings.map(b => b.id === data.booking.id ? data.booking : b));

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });

        // Open 5-dimension review modal
        setReviewOpen(true);
      }
    } catch (err) {
      console.error('Failed to verify completion', err);
    }
  };

  // Submit 5-dimension review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          workerId: activeBooking.workerId,
          customerName: activeBooking.customerName || 'Priya Malhotra',
          customerCity: 'Mumbai',
          dimensions: {
            technicalQuality: Number(reviewForm.technicalQuality),
            professionalism: Number(reviewForm.professionalism),
            punctuality: Number(reviewForm.punctuality),
            valueForMoney: Number(reviewForm.valueForMoney),
            communication: Number(reviewForm.communication)
          },
          comment: reviewForm.comment
        })
      });

      if (res.ok) {
        setReviewSubmitted(true);
        setTimeout(() => {
          setReviewOpen(false);
          setReviewSubmitted(false);
          // refresh active booking
          setActiveBooking({ ...activeBooking, reviewSubmitted: true });
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Retrieving verified booking timeline...</p>
      </div>
    );
  }

  const currentStageIndex = TRACKING_STAGES.indexOf(activeBooking?.status || 'Confirmed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-1">
            Realtime Service Timeline
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Booking & Job Verification Tracker
          </h1>
        </div>

        {/* Quick Booking Switcher */}
        {bookings.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Booking:</span>
            <select
              value={activeBooking?.id}
              onChange={(e) => {
                const found = bookings.find(b => b.id === e.target.value);
                setActiveBooking(found);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
            >
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bookingNumber} — {b.workerName} ({b.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeBooking ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: Tracker Stepper & Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* 5-Stage Live Stepper Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 block">
                    {activeBooking.bookingNumber}
                  </span>
                  <h2 className="font-display font-bold text-lg text-white">
                    {activeBooking.serviceTitle}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                    Status: {activeBooking.status}
                  </span>
                </div>
              </div>

              {/* Visual 5-Stage Horizontal Stepper */}
              <div className="relative">
                {/* Background bar */}
                <div className="absolute top-5 left-4 right-4 h-1 bg-slate-800 -z-0" />
                <div
                  className="absolute top-5 left-4 h-1 bg-emerald-500 -z-0 transition-all duration-500"
                  style={{ width: `${(currentStageIndex / (TRACKING_STAGES.length - 1)) * 95}%` }}
                />

                <div className="grid grid-cols-5 gap-1 relative z-10 text-center">
                  {TRACKING_STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage} className="flex flex-col items-center space-y-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-slate-950 shadow-glow-green'
                              : 'bg-slate-950 border border-slate-700 text-slate-500'
                          } ${isCurrent ? 'ring-4 ring-emerald-500/30' : ''}`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold block ${
                          isCompleted ? 'text-white' : 'text-slate-500'
                        }`}>
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage Notes Log */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Live Dispatch & Progress Notes
                </span>
                <div className="space-y-2.5">
                  {activeBooking.trackingSteps?.map((step, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${step.completed ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                        <span className={`font-semibold ${step.completed ? 'text-white' : 'text-slate-500'}`}>
                          {step.step}:
                        </span>
                        <span className="text-slate-400">{step.note}</span>
                      </div>
                      {step.time && (
                        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{step.time}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo Simulation Controls */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  <strong className="text-amber-400">Demo Controller:</strong> Simulate dispatch workflow progression
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentStageIndex < TRACKING_STAGES.length - 1 && (
                    <button
                      onClick={() => advanceStage(TRACKING_STAGES[currentStageIndex + 1])}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-colors"
                    >
                      Advance to '{TRACKING_STAGES[currentStageIndex + 1]}'
                    </button>
                  )}
                </div>
              </div>

              {/* Verified Job Sign-Off Banner */}
              {activeBooking.status === 'Job Completed' && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 space-y-3 shadow-glow-green">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <FileCheck className="w-5 h-5 text-emerald-400" />
                      Job Completed — Customer Verification Required
                    </div>
                    {activeBooking.isVerifiedJob && (
                      <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase">
                        Verified Record Issued
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Confirming completion releases the escrow payout to the professional and issues an immutable Verified Job Record to their Skill Passport.
                  </p>

                  <div className="pt-2 flex gap-3">
                    {!activeBooking.isVerifiedJob ? (
                      <button
                        onClick={verifyCompletion}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all"
                      >
                        Confirm & Issue Verified Job Record
                      </button>
                    ) : (
                      <button
                        onClick={() => setReviewOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {activeBooking.reviewSubmitted ? 'Update 5-Dimension Review' : 'Submit 5-Dimension Review'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Worker Card & Price Breakdown */}
          <div className="space-y-6">
            {/* Assigned Worker Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-800 pb-2">
                Assigned Verified Professional
              </span>

              <div className="flex items-center gap-4">
                <img
                  src={activeBooking.workerAvatar}
                  alt={activeBooking.workerName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">{activeBooking.workerName}</h3>
                  <p className="text-xs text-amber-300 font-medium">{activeBooking.workerSpecialty}</p>
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
                    {activeBooking.workerBadge || '🟡 MASTER VERIFIED'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-400">Destination: {activeBooking.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="text-slate-400">Slot: {activeBooking.scheduledDate} ({activeBooking.scheduledTimeSlot})</span>
                </div>
              </div>

              <Link
                to={`/worker/${activeBooking.workerId}`}
                className="block w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center border border-slate-700 transition-colors"
              >
                View Full Skill Passport
              </Link>
            </div>

            {/* Price & Escrow Summary */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-800 pb-2">
                Escrow Payment Breakdown
              </span>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Standard Service Fee</span>
                  <span>₹{activeBooking.pricing?.serviceFee?.toLocaleString('en-IN')}</span>
                </div>
                {activeBooking.pricing?.skillTierPremium > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>{activeBooking.workerTier} Tier Skill Guarantee</span>
                    <span>+₹{activeBooking.pricing?.skillTierPremium}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{activeBooking.pricing?.tax}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">₹{activeBooking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Payment held safely in escrow. Razorpay Ref: {activeBooking.paymentId}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">No bookings available.</div>
      )}

      {/* 5-DIMENSION REVIEW MODAL */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-white">5-Dimension Technical Review</h3>
                <p className="text-xs text-slate-400">
                  Rate specific capability areas to update the worker's Customer Performance Score
                </p>
              </div>
              <button
                onClick={() => setReviewOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-lg text-white">Verified Review Published!</h4>
                <p className="text-xs text-slate-400">
                  Worker's Customer Performance Score and Skill Score have been recalculated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {/* 1. Technical Quality */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Technical Quality</span>
                    <span className="text-[10px] text-slate-500">Diagnostic precision & workmanship</span>
                  </div>
                  <select
                    value={reviewForm.technicalQuality}
                    onChange={(e) => setReviewForm({ ...reviewForm, technicalQuality: e.target.value })}
                    className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-amber-400 font-bold cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5 Stars</option>)}
                  </select>
                </div>

                {/* 2. Professionalism */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Professionalism</span>
                    <span className="text-[10px] text-slate-500">PPE adherence, safety & hygiene</span>
                  </div>
                  <select
                    value={reviewForm.professionalism}
                    onChange={(e) => setReviewForm({ ...reviewForm, professionalism: e.target.value })}
                    className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-amber-400 font-bold cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5 Stars</option>)}
                  </select>
                </div>

                {/* 3. Punctuality */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Punctuality</span>
                    <span className="text-[10px] text-slate-500">Arrival within designated time slot</span>
                  </div>
                  <select
                    value={reviewForm.punctuality}
                    onChange={(e) => setReviewForm({ ...reviewForm, punctuality: e.target.value })}
                    className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-amber-400 font-bold cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5 Stars</option>)}
                  </select>
                </div>

                {/* 4. Value for Money */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Value for Money</span>
                    <span className="text-[10px] text-slate-500">Fair transparent rate for skill delivered</span>
                  </div>
                  <select
                    value={reviewForm.valueForMoney}
                    onChange={(e) => setReviewForm({ ...reviewForm, valueForMoney: e.target.value })}
                    className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-amber-400 font-bold cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5 Stars</option>)}
                  </select>
                </div>

                {/* 5. Communication */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Communication</span>
                    <span className="text-[10px] text-slate-500">Explanation of fault & advice</span>
                  </div>
                  <select
                    value={reviewForm.communication}
                    onChange={(e) => setReviewForm({ ...reviewForm, communication: e.target.value })}
                    className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-amber-400 font-bold cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5 Stars</option>)}
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Detailed Technical Feedback</label>
                  <textarea
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Describe how the technician diagnosed and solved your issue..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
                >
                  Publish Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
