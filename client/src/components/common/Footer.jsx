import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Zap, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      {/* Platform Core USP Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-purple-500/10 border-b border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-amber-400 tracking-wider">The SkillServe Benchmark</p>
              <h4 className="font-display font-bold text-base md:text-lg text-white">
                "5 Stars Tell You What Customers Think. Skill Score Shows What They Can Actually Do."
              </h4>
            </div>
          </div>
          <Link
            to="/search"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            Find a Verified Professional
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                Skill<span className="text-emerald-400">Serve</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's first skill-verified service marketplace. Eliminating inflated star ratings through transparent practical tests, verified experience, and skill-based fair pay.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              100% Audited Professional Network
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider mb-4">
              Verified Trades
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search?category=Electricians" className="hover:text-white transition-colors">Electricians (Master Tier)</Link></li>
              <li><Link to="/search?category=AC+Technicians" className="hover:text-white transition-colors">AC & Inverter HVAC Techs</Link></li>
              <li><Link to="/search?category=Plumbers" className="hover:text-white transition-colors">Plumbers & Acoustic Leak Detectors</Link></li>
              <li><Link to="/search?category=Carpenters" className="hover:text-white transition-colors">Carpenters & Modular Hardware</Link></li>
              <li><Link to="/search?category=Appliance+Repair" className="hover:text-white transition-colors">Appliance PCB Repair</Link></li>
              <li><Link to="/search?category=Web+Developers" className="hover:text-white transition-colors">Fullstack Web Developers</Link></li>
            </ul>
          </div>

          {/* Col 3: For Professionals */}
          <div>
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider mb-4">
              For Skilled Workers
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/worker-dashboard" className="hover:text-amber-300 transition-colors">Take Practical Assessment</Link></li>
              <li><Link to="/worker-dashboard" className="hover:text-amber-300 transition-colors">Digital Skill Passport & QR</Link></li>
              <li><Link to="/worker-dashboard" className="hover:text-amber-300 transition-colors">Fair Pay & Pricing Range</Link></li>
              <li><Link to="/worker-dashboard" className="hover:text-amber-300 transition-colors">Level Up Roadmap</Link></li>
              <li><span className="text-amber-400 font-semibold block mt-2">"Prove Your Skill. Earn What You're Worth."</span></li>
            </ul>
          </div>

          {/* Col 4: Platform Security */}
          <div>
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider mb-4">
              Trust & Governance
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/admin" className="hover:text-purple-300 transition-colors">National Verification Directorate</Link></li>
              <li><span className="text-slate-400">Anti-Fraud & Escrow Guarantee</span></li>
              <li><span className="text-slate-400">Multi-Dimensional Review Auditing</span></li>
              <li><span className="text-slate-400">Razorpay Encrypted Payments</span></li>
              <li><span className="text-slate-400">ISO 9001 Alignment Standards</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillServe Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            Engineered for fair blue-collar and white-collar professional empowerment.
          </div>
        </div>
      </div>
    </footer>
  );
}
