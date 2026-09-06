import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardCheck,
  TrendingUp,
  User,
  CalendarDays,
  Home,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SkillBadge from '../common/SkillBadge';
import SkillScore from '../common/SkillScore';
import { getInitials } from '../../utils/helpers';

export default function WorkerLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/worker/assessments', label: 'My Assessments', icon: ClipboardCheck },
    { to: '/worker/skill-progress', label: 'Skill Progress', icon: TrendingUp },
    { to: '/worker/profile-edit', label: 'Edit Profile', icon: User },
    { to: '/worker/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/', label: 'Back to Home', icon: Home },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-7 h-7 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">SkillServe</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            {user && (
              <div className="mt-4 flex items-center gap-3">
                <SkillBadge level={user?.workerProfile?.skillLevel || 'basic'} size="sm" />
                <SkillScore score={user?.workerProfile?.skillScore || 0} size="sm" />
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:px-6 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navItems.find((item) => isActive(item.to))?.label || 'Dashboard'}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <SkillBadge level={user?.workerProfile?.skillLevel || 'basic'} size="sm" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
