import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="text-2xl font-black text-white tracking-tight font-display">
                Kaushal<span className="text-emerald-400">ID</span>
              </span>
            </Link>

            <p className="text-base font-medium text-emerald-400 font-display">
              “Prove Your Skills. Build Your Identity. Earn Better.”
            </p>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India's digital Skill Passport platform for blue-collar and gig workers. We help skilled technicians verify practical competency, secure transparent work, and build an untamperable professional reputation.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>NSQF-aligned practical skill verification framework</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition">How It Works</Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-white transition">Key Features</Link>
              </li>
              <li>
                <Link to="/skill-passport" className="hover:text-white transition">Skill Passport</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Verify a Worker</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition">Get Started</Link>
              </li>
            </ul>
          </div>

          {/* For Workers & Employers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-mono">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/#for-workers" className="hover:text-white transition">For Workers</Link>
              </li>
              <li>
                <Link to="/#for-employers" className="hover:text-white transition">For Employers</Link>
              </li>
              <li>
                <Link to="/worker-dashboard" className="hover:text-white transition">Worker Dashboard</Link>
              </li>
              <li>
                <Link to="/employer-dashboard" className="hover:text-white transition">Employer Portal</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About KaushalID</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-mono">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li>
                <a href="mailto:support@kaushalid.in" className="hover:text-white transition flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>support@kaushalid.in</span>
                </a>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1800-KAUSHAL-ID</span>
                </span>
              </li>
              <li className="pt-2">
                <Link to="/privacy-policy" className="hover:text-white text-xs text-slate-400 transition block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-white text-xs text-slate-400 transition block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} KaushalID Technologies Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Built for India's Skilled Workforce</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-mono">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
