import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Building2,
  Lock,
  HardHat
} from 'lucide-react';

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const FAQS = [
    {
      q: "How does KaushalID verify a worker's technical skills?",
      a: "KaushalID combines practical hands-on assessments, trade-specific diagnostic evaluations, and verification of recognized government and industry certifications (such as ITI and state PWD wireman licenses). Assessment results generate an authenticated skill score and tamper-evident QR passport."
    },
    {
      q: "Why is KaushalID different from aggregator star ratings?",
      a: "Aggregators and classifieds judge workers solely on customer reviews and subjective moods, which fail to evaluate whether a technician understands safety codes, load balancing, or proper grounding. Furthermore, workers lose their entire rating history if they leave the platform. KaushalID is a portable digital credential owned by the worker."
    },
    {
      q: "How can a customer or employer verify a worker on site?",
      a: "Anyone can point their smartphone camera at the worker's KaushalID QR code (on physical smart card, mobile screen, or badge) to immediately view their verified skills, certifications, and background verification."
    },
    {
      q: "What benefits do employers and contractors receive?",
      a: "Contractors use KaushalID to verify subcontractor credentials, reduce on-site rework, meet regulatory compliance, and discover verified technicians filtered by trade and skill benchmarks."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            About KaushalID
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight font-display">
            “Prove Your Skills. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Build Your Identity. Earn Better.”
            </span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            KaushalID is India’s portable digital Skill Passport and practical skill-verification platform, giving unorganized tradesmen the professional recognition, dignity, and earnings they have earned.
          </p>
        </div>

        {/* Pillars of KaushalID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <HardHat className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Worker-Owned Reputation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every certification, audited skill score, and client project is permanently tied to the technician’s KaushalID, liberating them from closed platform lock-in.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Practical Skill Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We test actual trade execution — from multimeter diagnosis to pipe pressure testing — replacing subjective 5-star customer ratings with objective technical evidence.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Enterprise Trust
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real estate builders, MEP contractors, and commercial facilities verify workforce safety compliance and qualifications instantly through smartphone QR scanning.
            </p>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Everything you need to know about the KaushalID digital passport
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div 
                key={i} 
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:bg-slate-50 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-emerald-600/15">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-display">Ready to get your verified KaushalID?</h3>
            <p className="text-xs text-emerald-100">Join the digital passport network and showcase your real skills today.</p>
          </div>
          <Link
            to="/signup?type=worker"
            className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm shadow-md transition hover:bg-slate-50 active:scale-95 flex-shrink-0"
          >
            Create Your Skill Passport
          </Link>
        </div>

      </div>
    </div>
  );
}
