import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from './LogoutModal';
import UserMenu from './UserMenu';
import {
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ArrowRight,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'For Workers', path: '/#for-workers' },
    { name: 'For Employers', path: '/#for-employers' },
    { name: 'About', path: '/about' },
  ];

  // Helper for hash navigation or route navigation
  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const elementId = path.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  };

  const dashboardPath = user?.role === 'admin' 
    ? '/admin' 
    : (user?.role === 'employer' ? '/employer-dashboard' : '/worker-dashboard');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* KaushalID Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/15 group-hover:scale-105 transition-transform flex-shrink-0">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 group-hover:text-teal-600 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight font-display">
                    Kaushal<span className="text-emerald-600">ID</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200/80">
                    PASSPORT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block tracking-wide font-medium">
                  National Skill Identity Registry
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isHash = link.path.startsWith('/#');
                return isHash ? (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.path)}
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                      location.pathname === link.path
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Controls: Logged In vs Logged Out State */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isAuthenticated ? (
                /* Authenticated State: Dashboard | Profile | Logout */
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    to={dashboardPath}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-bold border border-red-200 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>

                  {/* Profile Dropdown Component */}
                  <UserMenu onOpenLogoutModal={() => setShowLogoutModal(true)} />
                </div>
              ) : (
                /* Logged Out State: Login | Get Started */
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Get Started</span>
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3.5 py-1 text-xs text-slate-500 font-medium">
                    Signed in as <span className="font-bold text-slate-800">{user?.displayName || user?.email}</span>
                  </div>
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 text-center text-sm font-bold border border-emerald-200 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-800 text-center text-sm font-bold border border-slate-200 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-600" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-50 text-red-600 text-center text-sm font-bold border border-red-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-800 text-center text-sm font-bold border border-slate-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-center text-sm font-bold shadow-md shadow-emerald-600/20"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Dialog Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}
