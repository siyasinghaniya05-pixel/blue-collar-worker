import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ChevronDown, 
  LayoutDashboard, 
  Award, 
  FileText, 
  LogOut, 
  ShieldCheck,
  Building2,
  HardHat
} from 'lucide-react';

export default function UserMenu({ onOpenLogoutModal }) {
  const { user, userType } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const isWorker = user.role === 'worker';
  const isAdmin = user.role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : (isWorker ? '/worker-dashboard' : '/employer-dashboard');
  const initials = (user.displayName || user.name || user.email || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200/90 transition text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        aria-expanded={isOpen}
      >
        {/* User Avatar Circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
          {initials}
        </div>

        {/* User Info */}
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
            <span className="truncate max-w-[120px]">{user.displayName || user.name || 'Account'}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
              isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' : (isWorker ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800')
            }`}>
              {isAdmin ? 'Admin' : (isWorker ? 'Worker' : 'Employer')}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {user.kaushalId || user.companyId || user.email?.split('@')[0]}
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Signed in as</p>
            <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || 'Valued User'}</p>
            <p className="text-xs text-slate-500 truncate font-mono">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              to={dashboardPath}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition font-medium"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition font-medium"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>My Profile</span>
            </Link>

            {isWorker && (
              <Link
                to="/skill-passport"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition font-medium"
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Skill Passport</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLogoutModal();
              }}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
