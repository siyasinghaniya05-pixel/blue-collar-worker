import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SkillPassportCard from '../components/common/SkillPassportCard';
import VerificationBadge from '../components/common/VerificationBadge';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  QrCode, 
  Search, 
  Users, 
  HardHat, 
  Building2, 
  FileText, 
  Smartphone, 
  Sparkles,
  ChevronRight,
  ChevronDown,
  Lock,
  Layers,
  Check,
  AlertTriangle,
  SlidersHorizontal,
  ExternalLink,
  HelpCircle,
  FileCheck2,
  Scale
} from 'lucide-react';

export default function LandingPage() {
  const [quickVerifyId, setQuickVerifyId] = useState('');
  const [verifyMessage, setVerifyMessage] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (!quickVerifyId.trim()) return;
    const cleanId = quickVerifyId.trim().toUpperCase();
    navigate(`/passport/${cleanId}`);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      
      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60">
        
        {/* Subtle decorative background gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Official Credential Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>India's Verified Digital Skill Passport Registry</span>
              </div>

              {/* Exact Prompt Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] font-display">
                Prove Your Skills.{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  Build Your Identity.
                </span>{' '}
                Earn Better.
              </h1>

              {/* Exact Prompt Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                KaushalID gives skilled workers a verified digital identity that showcases their practical skills, certifications, and work history — all in one portable Skill Passport.
              </p>

              {/* Exact Prompt Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/signup?type=worker"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/20 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Get Your Skill Passport</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#for-employers"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-xs transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verify a Worker</span>
                </a>
              </div>

              {/* Fast Direct KaushalID Search Bar */}
              <div className="pt-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Worker Passport Lookup</span>
                </div>
                <form 
                  onSubmit={handleQuickVerify}
                  className="flex items-center bg-white border border-slate-300 rounded-xl p-1.5 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition"
                >
                  <input
                    type="text"
                    value={quickVerifyId}
                    onChange={(e) => setQuickVerifyId(e.target.value)}
                    placeholder="Enter ID e.g. KID-IN-MH-10248..."
                    className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg transition flex-shrink-0"
                  >
                    Verify
                  </button>
                </form>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Try demo ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-bold">KID-IN-MH-10248</code>
                </p>
              </div>

            </div>

            {/* Right Column: Visual Mockup of Digital Skill Passport */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg">
                <div className="text-center mb-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    Demonstration Passport Preview
                  </span>
                </div>
                {/* Visual Passport Mockup */}
                <SkillPassportCard
                  worker={{
                    displayName: 'Rajesh Patil',
                    kaushalId: 'KID-IN-MH-10248',
                    trade: 'Senior Electrical Technician',
                    city: 'Mumbai, Maharashtra',
                    experienceYears: 6,
                    verifiedStatus: 'verified',
                    verificationLevel: 'Level 3 - Master Technician',
                    verificationDate: '14 Jan 2026',
                    completionRate: 92,
                    skills: [
                      { name: 'Three-Phase Wiring & Distribution', score: 96, verified: true, level: 'Master' },
                      { name: 'MCB & Substation Installation', score: 92, verified: true, level: 'Master' },
                      { name: 'Industrial Earthing & Safety', score: 94, verified: true, level: 'Master' },
                      { name: 'Multimeter & Fault Diagnostics', score: 98, verified: true, level: 'Master' }
                    ],
                    certifications: [
                      {
                        id: 'CERT-NSDC-2024-098',
                        name: 'National Skills Qualification Framework (NSQF Level 5)',
                        issuer: 'Skill India / NSDC',
                        issueDate: 'Oct 2024',
                        verified: true
                      }
                    ],
                    workHistory: [
                      {
                        project: 'Metro Line 3 Commercial Substation Setup',
                        client: 'L&T Construction MEP Division',
                        period: '2024 - 2025',
                        verified: true
                      }
                    ]
                  }}
                  showFullDetails={false}
                />

                {/* Floating Micro-Badge */}
                <div className="absolute -bottom-4 -left-4 sm:left-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-lg flex items-center gap-3 hidden sm:flex">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tamper-Proof Verification</div>
                    <div className="text-[11px] text-slate-500 font-mono">100% Cryptographic QR Proof</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM SECTION                                                       */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              The Fundamental Challenge
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-display">
              “Skills Deserve More Than Just Ratings.”
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Traditional aggregator star ratings fail skilled workers and employers alike because they measure punctuality or mood — not actual technical capability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Problem 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 font-display">
                Difficult to Prove Real Technical Skills
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Skilled tradesmen have years of hands-on expertise with complex wiring, plumbing, or mechanics, yet have no standardized paper or digital record to validate their mastery to new contractors.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 font-display">
                Customers Struggle to Identify Genuinely Skilled Workers
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Homeowners and site managers face trial-and-error risks when hiring, often discovering deficient work or safety violations only after critical installations fail.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-6">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 font-display">
                Experience & Ratings Don't Fully Verify Technical Ability
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A 5-star customer review on a gig app only shows customer friendliness. It does not certify that a technician knows how to measure load limits, follow safety codes, or diagnose shorts.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW KAUSHALID WORKS (TIMELINE)                                        */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Clear & Transparent Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-display">
              How KaushalID Works
            </h2>
            <p className="text-base text-slate-600 mt-3">
              A 4-step practical framework transforming raw manual skills into an accredited digital asset.
            </p>
          </div>

          {/* Desktop Horizontal Timeline / Mobile Vertical Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-12 right-12 h-0.5 bg-slate-200 -z-0" />

            {/* Step 01 */}
            <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-mono font-bold text-base flex items-center justify-center mb-4 shadow-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                Create Profile
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Worker creates their KaushalID profile with basic identity, primary trade, and work experience.
              </p>
            </div>

            {/* Step 02 */}
            <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-mono font-bold text-base flex items-center justify-center mb-4 shadow-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                Verify Skills
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Worker completes practical skill assessment and diagnostic questions mapped to trade standards.
              </p>
            </div>

            {/* Step 03 */}
            <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-mono font-bold text-base flex items-center justify-center mb-4 shadow-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                Get Skill Passport
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Verified skills, scores, and official trade certifications are added to the digital Skill Passport.
              </p>
            </div>

            {/* Step 04 */}
            <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-mono font-bold text-base flex items-center justify-center mb-4 shadow-sm">
                04
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                Share & Get Verified
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Worker shares their QR code with customers or employers for instant instant verification.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. KEY FEATURES                                                          */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-display">
              Comprehensive Built-in Capabilities
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Engineered specifically for the real-world operational needs of blue-collar workers and enterprise contractors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">🔐</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                Practical Skill Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hands-on technical assessment modules evaluating real trade competency, safety standards, and tool usage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">🪪</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                Digital Skill Passport
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A unified, verifiable digital credential summarizing trades, skill scores, and government-aligned levels.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                QR-Based Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant smartphone camera scanning providing authentic live verification without any app installation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">📜</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                Verified Certifications
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct integration with state PWD licenses, NSDC, ITI, and safety compliance accreditations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">💼</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                Work History
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chronological record of verified industrial, commercial, and residential projects completed with client signoffs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">🔎</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                Worker Search
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fast multi-factor directory enabling employers to find verified technicians by city, trade, and skill score.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">👨‍🔧</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                Worker Profile
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Intuitive worker dashboard to track profile completion, review badge levels, and generate printable cards.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition">
              <div className="text-2xl mb-3">🏢</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                Employer Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enterprise dashboard with bulk verification lookups, saved candidate pipelines, and validation audit logs.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WORKER SECTION                                                        */}
      {/* ========================================================================= */}
      <section id="for-workers" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, Explanation & CTA */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Empowering Skilled Craftsmen
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
                “Turn Your Skills Into a Verified Identity.”
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Stop relying on word of mouth or subjective star ratings. With KaushalID, your hard-earned technical capability is authenticated into an immutable Skill Passport you carry anywhere.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Command higher hourly wages with accredited skill scores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Win high-value enterprise commercial contracts directly</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Share your QR code on WhatsApp, business cards, or resumes</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/signup?type=worker"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Create Your Skill Passport</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Worker Dashboard Preview */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
                
                {/* Header in Preview */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center">
                      RP
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-display">Rajesh Patil</h3>
                      <p className="text-xs text-slate-500 font-mono">KID-IN-MH-10248 &bull; Electrician</p>
                    </div>
                  </div>
                  <VerificationBadge level="Level 3 - Master" status="verified" />
                </div>

                {/* Profile Completion Bar */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-700">Profile Completion</span>
                    <span className="font-mono font-bold text-emerald-700">92% Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                {/* Verified Skills Preview */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2.5">
                    Verified Technical Skills
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Three-Phase Wiring</span>
                      <span className="font-mono text-emerald-700 font-bold">96%</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Substation Installation</span>
                      <span className="font-mono text-emerald-700 font-bold">92%</span>
                    </div>
                  </div>
                </div>

                {/* Work Experience & Certifications Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Certifications
                    </div>
                    <p className="text-slate-500 text-[11px]">NSQF Level 5 & PWD Class-A License</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      Work Experience
                    </div>
                    <p className="text-slate-500 text-[11px]">6+ Years &bull; Metro Line 3 MEP Lead</p>
                  </div>
                </div>

                {/* QR Skill Passport Preview & Share Button */}
                <div className="pt-2 flex items-center justify-between bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">QR Skill Passport Ready</div>
                      <div className="text-[11px] text-slate-500">Scan code for immediate verification</div>
                    </div>
                  </div>
                  <Link
                    to="/signup?type=worker"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    Share Profile
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. EMPLOYER / CUSTOMER SECTION                                           */}
      {/* ========================================================================= */}
      <section id="for-employers" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Employer Tools Preview */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
                
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Verified Worker Discovery
                    </h3>
                    <p className="text-xs text-slate-500">
                      Filter candidate pool by verified competency &bull; <span className="font-mono text-[10px] text-slate-400">Demonstration Preview</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                      Verified Only
                    </span>
                  </div>
                </div>

                {/* Worker List Card Items */}
                <div className="space-y-3">
                  {/* Worker 1 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm">
                        RP
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          Rajesh Patil
                          <VerificationBadge level="Master" status="verified" size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Senior Electrician &bull; Mumbai &bull; Score: 95%
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/passport/KID-IN-MH-10248"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                    >
                      View Passport
                    </Link>
                  </div>

                  {/* Worker 2 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm">
                        AK
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          Amit Kumar
                          <VerificationBadge level="Skilled" status="verified" size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          HVAC & Chiller Tech &bull; Delhi NCR &bull; Score: 91%
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/passport/KID-IN-DL-4091"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                    >
                      View Passport
                    </Link>
                  </div>
                </div>

                {/* Features Highlights for Employers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <QrCode className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="font-bold text-slate-900 block">Scan QR Codes</span>
                    <span className="text-[10px] text-slate-500">On-site verification</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="font-bold text-slate-900 block">Check Certs</span>
                    <span className="text-[10px] text-slate-500">Licenses & NSQF</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <Briefcase className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="font-bold text-slate-900 block">Review History</span>
                    <span className="text-[10px] text-slate-500">Audited project logs</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Headline, Description & CTA */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                For Contractors & Property Owners
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
                “Find Skills You Can Trust.”
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Eliminate hiring guesswork and reduce project rework. Verify any worker's genuine skill level in seconds before they touch your electrical panels, plumbing lines, or job sites.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span>Search verified workers filtered by trade, city, and score</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span>View authentic practical assessment score breakdowns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span>Scan physical QR codes on site for instant identity proof</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span>Review validated past project milestones and references</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/signup?type=employer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-md shadow-teal-600/20 transition active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-200" />
                  <span>Verify a Worker</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. ASSESSMENT & CERTIFICATION PROCESS                                     */}
      {/* ========================================================================= */}
      <section id="assessment-process" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Rigorous Quality Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-display">
              Practical Assessment & Certification Process
            </h2>
            <p className="text-base text-slate-600 mt-3">
              We separate self-reported claims from verified capability through a transparent, 4-phase competency evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold font-mono flex items-center justify-center">
                    01
                  </div>
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                  Select Trade & Modules
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Worker chooses their primary trade (Electrician, Plumber, HVAC, Carpenter) and selects specific practical competency modules mapped to industry standards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                Self-Reported &rarr; Assessment Queue
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold font-mono flex items-center justify-center">
                    02
                  </div>
                  <Scale className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                  Book Practical Assessment
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Worker schedules an evaluation with a transparent assessment fee of <strong>₹499</strong> per unit, covering independent evaluation and registry issuance.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-700">
                Transparent Configurable Pricing
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold font-mono flex items-center justify-center">
                    03
                  </div>
                  <HardHat className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                  Practical Evaluation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Certified assessors review diagnostic tasks, tool safety protocols, wiring/plumbing standards, and record rubric scores and photographic evidence.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-indigo-700">
                Objective Competency Rubric
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold font-mono flex items-center justify-center">
                    04
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                  Verification & Credential Minting
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authorized reviewers approve the submission. A unique cryptographic KaushalID is minted to the worker's digital Skill Passport with live QR verification.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800">
                Tamper-Proof Digital Passport
              </div>
            </div>

          </div>

          {/* Ethics & Integrity Note */}
          <div className="mt-10 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Zero Tolerance for Fabricated Credentials</h4>
                <p className="text-xs text-slate-500">
                  KaushalID strictly maintains an immutable audit trail. Self-reported claims are never displayed as verified credentials without assessor review.
                </p>
              </div>
            </div>
            <Link
              to="/assessments"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex-shrink-0"
            >
              Explore Assessment Rubrics
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ)                                       */}
      {/* ========================================================================= */}
      <section id="faqs" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Clear & Transparent Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Everything you need to know about the KaushalID Skill Passport, verification, and pricing.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* FAQ Item 1 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full p-5 text-left bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 transition"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  How does KaushalID verify a worker's practical skills?
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 0 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 0 && (
                <div className="p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 animate-in fade-in">
                  Unlike gig aggregator apps that rely on customer stars (which only reflect customer friendliness or punctuality), KaushalID evaluates actual trade competency. Workers submit practical assessments, diagnostic tasks, tool safety records, and existing trade certificates (such as ITI, NSQF, or state licenses). Authorized assessors inspect the evidence and assign an objective competency score.
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full p-5 text-left bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 transition"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  What is the cost of skill assessments and employer subscriptions?
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <div className="p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 animate-in fade-in">
                  Basic worker profile creation and digital identity storage are completely free. Practical skill assessments are offered at an initial proposed price of <strong>₹499 per assessment unit</strong>. For employers and commercial contractors, unlimited talent search, credential verification, and candidate bookmarking are available through an enterprise subscription at <strong>₹999 per month</strong>.
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full p-5 text-left bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 transition"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  How does on-site QR verification work for contractors and customers?
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <div className="p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 animate-in fade-in">
                  Every worker is issued a unique cryptographic KaushalID with an on-screen QR code. Anyone with a smartphone camera can scan the code to load the official verification record directly from the registry. The page displays whether the credential is <strong>VERIFIED</strong>, <strong>UNDER REVIEW</strong>, <strong>EXPIRED</strong>, or <strong>REVOKED</strong>, without requiring any app download.
                </div>
              )}
            </div>

            {/* FAQ Item 4 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full p-5 text-left bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 transition"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  Is KaushalID an official government agency?
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 3 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 3 && (
                <div className="p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 animate-in fade-in">
                  No. KaushalID is an independent skill-technology platform. While our skill frameworks align with national standards such as the National Skills Qualification Framework (NSQF), we do not falsely claim to be a government ministry or issue government-stamped documents unless explicitly certified by authorized partner bodies.
                </div>
              )}
            </div>

            {/* FAQ Item 5 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="w-full p-5 text-left bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 transition"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  How does KaushalID protect worker privacy?
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 4 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 4 && (
                <div className="p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 animate-in fade-in">
                  Public verification pages intentionally mask sensitive personal details such as private phone numbers, home street addresses, and government ID numbers. Only verified professional competencies, scores, certifications, and service areas are visible publicly, preventing scraping and unwanted solicitation.
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FINAL CALL TO ACTION STRIP                                            */}
      {/* ========================================================================= */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
            Ready to Build Your Verified Skill Identity?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-normal">
            Join thousands of skilled professionals across India who are turning their practical abilities into a permanent, portable digital career asset.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/signup?type=worker"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base shadow-lg transition active:scale-95"
            >
              Get Started as a Worker
            </Link>
            <Link
              to="/signup?type=employer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base border border-emerald-400/40 transition active:scale-95"
            >
              Join as an Employer
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
