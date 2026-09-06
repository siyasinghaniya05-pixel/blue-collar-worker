import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Star,
  ThumbsUp,
  CreditCard,
  QrCode,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';
import SkillScoreMeter from '../components/common/SkillScoreMeter';
import SkillPassportModal from '../components/common/SkillPassportModal';
import RazorpayModal from '../components/common/RazorpayModal';
import { useAuth } from '../context/AuthContext';

export default function WorkerProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passportOpen, setPassportOpen] = useState(false);

  // Booking Modal State
  const [bookingOpen, setBookingOpen] = useState(searchParams.get('book') === 'true');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('11:00 AM - 01:00 PM');
  const [address, setAddress] = useState(user?.address || 'A-402, Sea Crest Towers, Bandra West, Mumbai');
  const [serviceNotes, setServiceNotes] = useState('');
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [activeBookingResponse, setActiveBookingResponse] = useState(null);

  // Before/After Slider state for portfolio
  const [sliderPos, setSliderPos] = useState(50); // percentage

  useEffect(() => {
    async function loadWorker() {
      setLoading(true);
      try {
        const res = await fetch(`/api/workers/${id || 'w-1'}`);
        if (res.ok) {
          const data = await res.json();
          setWorker(data);
        }
      } catch (err) {
        console.error('Failed to load worker profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorker();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Fetching verified worker credentials & portfolio...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Worker Profile Not Found</h2>
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Return to Search
        </button>
      </div>
    );
  }

  // Pricing calculations
  const basePrice = worker.pricing?.basePrice || 1199;
  const tierPremium = worker.level >= 4 ? 200 : worker.level === 3 ? 100 : 0;
  const estimatedTax = Math.round((basePrice + tierPremium) * 0.05);
  const totalPayable = basePrice + tierPremium + estimatedTax;

  const handleCreateBooking = async () => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user?.id || 'usr-customer-1',
          customerName: user?.name || 'Priya Malhotra',
          customerPhone: user?.phone || '+91 98201 45892',
          workerId: worker.id,
          serviceTitle: `${worker.specialty} Diagnostic & Service Visit`,
          category: worker.category,
          scheduledDate,
          scheduledTimeSlot,
          address,
          notes: serviceNotes
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBookingResponse(data.booking);
        setBookingOpen(false);
        setRazorpayOpen(true);
      }
    } catch (err) {
      console.error('Failed to create booking', err);
    }
  };

  const handlePaymentSuccess = (paymentDetails) => {
    if (activeBookingResponse) {
      navigate(`/bookings?id=${activeBookingResponse.id}`);
    } else {
      navigate('/bookings');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Profile Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-amber-400/60 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2">
                <SkillBadge level={worker.level} size="sm" showLabel={false} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  {worker.name}
                </h1>
                <SkillBadge level={worker.level} size="md" />
              </div>

              <p className="text-sm font-semibold text-amber-300">
                {worker.specialty} • {worker.category}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {worker.city} ({worker.areasServed?.slice(0, 3).join(', ')})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-emerald-400" />
                  {worker.rating} / 5.0 Customer Score ({worker.reviewCount || 312} Reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Box: Skill Score & Action Buttons */}
          <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
            <div className="flex flex-col items-center text-center">
              <SkillScoreMeter
                score={worker.skillScore}
                size="md"
                workerName={worker.name}
                breakdownData={worker.scoreComponents}
              />
              <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">
                Skill Score
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BOOK NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPassportOpen(true)}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                Skill Passport & QR
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Experience</span>
            <span className="text-base font-extrabold font-display text-white">{worker.experienceYears} Years</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Jobs Completed</span>
            <span className="text-base font-extrabold font-display text-white">{worker.jobsCompleted.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Job Success Rate</span>
            <span className="text-base font-extrabold font-display text-emerald-400">{worker.stats?.jobSuccessRate}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">On-Time Arrival</span>
            <span className="text-base font-extrabold font-display text-purple-400">{worker.stats?.onTimeRate}%</span>
          </div>
        </div>
      </div>

      {/* 2. Main Columns: Left (Skills, Verification, Portfolio) & Right (Pricing & Certifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h2 className="font-display font-bold text-base text-white">Professional Bio & Scope</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{worker.bio}</p>
          </div>

          {/* Skill Breakdown (Bars) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Verified Practical Skill Breakdown
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Audited Benchmark
              </span>
            </div>

            <div className="space-y-3.5">
              {worker.skillBreakdown?.map((skill, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{skill.name}</span>
                    <span className="font-mono font-bold text-amber-400">{skill.score}% Accuracy</span>
                  </div>
                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              SkillServe 5-Point Trust & Verification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Identity Verified</div>
                  <div className="text-[11px] text-slate-400">{worker.verifications?.identityDocType || 'Aadhaar / Govt ID'}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Practical Skill Test Passed</div>
                  <div className="text-[11px] text-slate-400">Score: {worker.verifications?.practicalTestScore}% Benchmark</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Experience Verified</div>
                  <div className="text-[11px] text-slate-400">{worker.experienceYears} Years Verified Trade Record</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Certification Verified</div>
                  <div className="text-[11px] text-slate-400">{worker.certifications?.length || 1} Accredited Licenses</div>
                </div>
              </div>

              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Background & Police Clearance</div>
                  <div className="text-[11px] text-slate-400">{worker.verifications?.backgroundStatus || 'Clear - National Database Checked'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Portfolio (Before/After Comparison Slider) */}
          {worker.portfolio && worker.portfolio.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-5 h-5 text-purple-400" />
                Work Portfolio & Before/After Proof
              </h2>

              {worker.portfolio.map((item) => (
                <div key={item.id} className="space-y-3">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.description}</p>

                  {/* Interactive Before/After Split */}
                  <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden select-none border border-slate-800">
                    {/* After Image (Full background) */}
                    <img
                      src={item.afterImage}
                      alt="After completion"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                      AFTER (Completed)
                    </span>

                    {/* Before Image (Clipped by slider position) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={item.beforeImage}
                        alt="Before condition"
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{ width: '100%', height: '100%' }}
                      />
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-bold">
                        BEFORE (Fault)
                      </span>
                    </div>

                    {/* Draggable Divider Line */}
                    <div
                      className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-7 h-7 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg text-[10px] font-bold">
                        ↔
                      </div>
                    </div>

                    {/* Slider Input overlay */}
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                    />
                  </div>
                  <p className="text-[11px] text-center text-slate-500 italic">
                    Drag the slider left or right to inspect before and after quality
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Customer Reviews (5 Dimensions) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-emerald-400" />
                Verified Customer Reviews & Performance
              </h2>
              <span className="text-xs text-slate-400">Only verified bookings can review</span>
            </div>

            <div className="space-y-4">
              {worker.reviews && worker.reviews.length > 0 ? (
                worker.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{rev.customerName}</span>
                        <span className="text-[10px] text-slate-500">{rev.customerCity} • {rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Job Completed
                      </div>
                    </div>

                    {/* 5-Dimension Mini Bar Ratings */}
                    {rev.dimensions && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg">
                        <div>
                          <span className="block text-slate-500">Tech Quality</span>
                          <strong className="text-white">{rev.dimensions.technicalQuality}/5</strong>
                        </div>
                        <div>
                          <span className="block text-slate-500">Professionalism</span>
                          <strong className="text-white">{rev.dimensions.professionalism}/5</strong>
                        </div>
                        <div>
                          <span className="block text-slate-500">Punctuality</span>
                          <strong className="text-white">{rev.dimensions.punctuality}/5</strong>
                        </div>
                        <div>
                          <span className="block text-slate-500">Value</span>
                          <strong className="text-white">{rev.dimensions.valueForMoney}/5</strong>
                        </div>
                        <div>
                          <span className="block text-slate-500">Communication</span>
                          <strong className="text-white">{rev.dimensions.communication}/5</strong>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No reviews recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Certifications */}
        <div className="space-y-6">
          {/* Fair Pay / Pricing Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 sticky top-24">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Standard Pricing Range
              </span>
              <div className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
                {worker.pricing?.rangeText || `₹${basePrice.toLocaleString('en-IN')}`}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Calibrated to Level {worker.level} ({worker.tierName}) certified skill benchmarks.
              </p>
            </div>

            {/* Price Explainer banner */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-400 block mb-0.5">SkillServe Fair Pay Guarantee:</span>
              "Higher price reflects verified expertise, experience and proven performance." No sudden on-site price extortion.
            </div>

            {/* Book Now Button */}
            <button
              onClick={() => setBookingOpen(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>BOOK APPOINTMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Certifications Box */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Audited Certifications
              </h3>

              <div className="space-y-2">
                {worker.certifications?.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{c.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-400">Issuer: {c.issuer}</div>
                    <div className="text-[10px] font-mono text-slate-500">Cred ID: {c.credentialId}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Drawer / Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[95vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Book Verified Appointment</h3>
                <p className="text-xs text-slate-400">{worker.name} • {worker.specialty}</p>
              </div>
              <button
                onClick={() => setBookingOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Date */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Time slot */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Time Slot</label>
                <select
                  value={scheduledTimeSlot}
                  onChange={(e) => setScheduledTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Service Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Street address, building, floor..."
                />
              </div>

              {/* Service description */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Problem Description</label>
                <input
                  type="text"
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Master bedroom switchboard sparkling or AC not blowing cool air"
                />
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Standard Diagnostic Fee</span>
                  <span>₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {tierPremium > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>{worker.tierName} Tier Skill Guarantee</span>
                    <span>+₹{tierPremium}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span>₹{estimatedTax}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
                  <span>Total Escrow Amount</span>
                  <span className="text-emerald-400">₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateBooking}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer"
            >
              Proceed to Pre-Authorize Payment
            </button>
          </div>
        </div>
      )}

      {/* Razorpay Simulation Modal */}
      <RazorpayModal
        isOpen={razorpayOpen}
        onClose={() => setRazorpayOpen(false)}
        amount={totalPayable}
        bookingDetails={{
          serviceTitle: `${worker.specialty} Service Visit (${worker.tierName} Tier)`
        }}
        onSuccess={handlePaymentSuccess}
      />

      {/* Skill Passport Modal */}
      <SkillPassportModal
        worker={worker}
        isOpen={passportOpen}
        onClose={() => setPassportOpen(false)}
      />
    </div>
  );
}
