import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, ChevronDown, LogOut, User, Briefcase, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [navigate]);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
    }`;

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'worker') return { to: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard };
    if (user.role === 'admin') return { to: '/admin', label: 'Admin Panel', icon: LayoutDashboard };
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <ShieldCheck className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">SkillServe</span>
                <span className="text-[10px] text-gray-400 font-medium leading-tight hidden sm:block">
                  Hire by Skill, Not Stars
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/" className={navLinkClass} end>
                Home
              </NavLink>
              <NavLink to="/search" className={navLinkClass}>
                Search
              </NavLink>
              {!isAuthenticated && (
                <NavLink to="/search" className={navLinkClass}>
                  How It Works
                </NavLink>
              )}
              {isAuthenticated && dashboardLink && (
                <NavLink to={dashboardLink.to} className={navLinkClass}>
                  {dashboardLink.label}
                </NavLink>
              )}
              {isAuthenticated && user?.role === 'customer' && (
                <NavLink to="/bookings" className={navLinkClass}>
                  My Bookings
                </NavLink>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl gradient-primary hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user?.name)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-primary-100 text-primary-700">
                            {user?.role}
                          </span>
                        </div>
                        <Link
                          to={
                            user?.role === 'worker'
                              ? '/worker/profile-edit'
                              : user?.role === 'admin'
                              ? '/admin'
                              : '/bookings'
                          }
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          {user?.role === 'worker' ? 'Edit Profile' : 'My Bookings'}
                        </Link>
                        {user?.role === 'worker' && (
                          <Link
                            to="/worker/dashboard"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Briefcase className="w-4 h-4" />
                            Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg md:hidden overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                Search Workers
              </NavLink>

              {isAuthenticated && dashboardLink && (
                <NavLink
                  to={dashboardLink.to}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {dashboardLink.label}
                </NavLink>
              )}
              {isAuthenticated && user?.role === 'customer' && (
                <NavLink
                  to="/bookings"
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  My Bookings
                </NavLink>
              )}

              <div className="border-t border-gray-100 mt-2 pt-2">
                {!isAuthenticated ? (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      className="flex-1 text-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center px-4 py-3 text-sm font-semibold text-white gradient-primary rounded-xl"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-4 py-3 rounded-xl bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
