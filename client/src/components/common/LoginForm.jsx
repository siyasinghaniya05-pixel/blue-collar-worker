import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  HardHat
} from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login, loginWithGoogle, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route to return to after login
  const intendedDestination = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (intendedDestination) {
        navigate(intendedDestination, { replace: true });
      } else {
        const dest = result.user.role === 'admin' 
          ? '/admin' 
          : (result.user.role === 'employer' ? '/employer-dashboard' : '/worker-dashboard');
        navigate(dest, { replace: true });
      }
    } else {
      setFormError(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setFormError('');
    const result = await loginWithGoogle('worker');
    setSubmitting(false);
    if (result.success) {
      const dest = intendedDestination || (result.user.role === 'admin' ? '/admin' : (result.user.role === 'employer' ? '/employer-dashboard' : '/worker-dashboard'));
      navigate(dest, { replace: true });
    } else {
      setFormError(result.error || 'Google authentication failed.');
    }
  };

  const handleDemoSignIn = async (role) => {
    setSubmitting(true);
    setFormError('');
    const result = await demoLogin(role);
    setSubmitting(false);
    if (result.success) {
      const dest = intendedDestination || (role === 'admin' ? '/admin' : (role === 'employer' ? '/employer-dashboard' : '/worker-dashboard'));
      navigate(dest, { replace: true });
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter your email address above to receive a password reset link.');
      return;
    }
    setFormError('');
    setResetSent(true);
    setTimeout(() => setResetSent(false), 5000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Welcome Back to KaushalID
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your verified Skill Passport and dashboard
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Reset Password Notification */}
        {resetSent && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Password reset instructions have been sent to {email}.</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Login Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-mono">Or continue with</span>
          </div>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Quick Demo Instant Logins Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2.5 text-center">
            Instant Demo Logins (For Presentation / Review)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('worker')}
              disabled={submitting}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition active:scale-95"
            >
              <HardHat className="w-4 h-4 text-emerald-600" />
              <span>Worker</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('employer')}
              disabled={submitting}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition active:scale-95"
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Employer</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              disabled={submitting}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Don't have an account bottom link */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
