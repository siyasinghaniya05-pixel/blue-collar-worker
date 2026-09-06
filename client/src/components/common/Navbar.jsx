import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Search,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Layers,
  Menu,
  X
} from 'lucide-react';
import SkillBadge from './SkillBadge';

export default function Navbar() {
  const { user, workerProfile, demoLogin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDemoSwitch = async (role) => {
    setDropdownOpen(false);
    await demoLogin(role);
    if (role === 'worker') navigate('/worker-dashboard');
    else if (role === 'admin') navigate('/admin');
    else navigate('/bookings');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-xl text-white tracking-tight">
                    Skill<span className="text-emerald-400">Serve</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                    Tiered
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  Verified Skill Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <Link
                to="/search"
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                Find Professionals
              </Link>
              <Link
                to="/match"
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Smart Match AI
              </Link>
              <Link
                to="/#how-it-works"
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-slate-900 transition-colors"
              >
                Verification System
              </Link>
            </div>
          </div>

          {/* Right Area: Role Actions & Quick Demo Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-amber-500/50 transition-all shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">Demo Role:</span>
                <span className="capitalize text-amber-400">{user?.role || 'Customer'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    1-Click Switch Persona
                  </div>

                  <button
                    onClick={() => handleDemoSwitch('customer')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-200"
                  >
                    <div>
                      <div className="font-bold text-white">Priya Malhotra</div>
                      <div className="text-slate-400 text-[11px]">Customer • Mumbai</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold text-[10px]">
                      Customer
                    </span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('worker')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-200"
                  >
                    <div>
                      <div className="font-bold text-white">Rahul Sharma</div>
                      <div className="text-slate-400 text-[11px]">Master Electrician (Score: 94)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold text-[10px]">
                      Master Pro
                    </span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-200"
                  >
                    <div>
                      <div className="font-bold text-white">Vikram Adani</div>
                      <div className="text-slate-400 text-[11px]">National Verification Admin</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold text-[10px]">
                      Admin
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Role-specific Shortcut Button */}
            {user?.role === 'worker' ? (
              <Link
                to="/worker-dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Worker Dashboard
              </Link>
            ) : user?.role === 'admin' ? (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all"
              >
                <Layers className="w-4 h-4" />
                Admin Panel
              </Link>
            ) : (
              <Link
                to="/bookings"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                My Bookings
              </Link>
            )}

            {/* User Profile avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-700"
              />
            </div>
          </div>

          {/* Mobile menu hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3 animate-in slide-in-from-top-4">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-200 font-medium"
          >
            Find Verified Professionals
          </Link>
          <Link
            to="/match"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-200 font-medium"
          >
            Smart Match AI
          </Link>
          <Link
            to="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-200 font-medium"
          >
            My Bookings & Tracker
          </Link>
          <Link
            to="/worker-dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-amber-400 font-medium"
          >
            Worker Dashboard & Assessments
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-purple-400 font-medium"
          >
            Admin Verification Directorate
          </Link>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Switch Persona:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => { handleDemoSwitch('customer'); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-blue-300 font-semibold"
              >
                Customer
              </button>
              <button
                onClick={() => { handleDemoSwitch('worker'); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-amber-300 font-semibold"
              >
                Worker
              </button>
              <button
                onClick={() => { handleDemoSwitch('admin'); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-purple-300 font-semibold"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
