import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  HardHat, 
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SignupForm() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('type') === 'employer' ? 'employer' : 'worker';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Field Validations
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify your entries.');
      return;
    }
    if (!userType) {
      setFormError('Please select whether you are registering as a Worker or Employer.');
      return;
    }

    setSubmitting(true);
    const result = await signup({
      fullName,
      email,
      password,
      role: userType
    });
    setSubmitting(false);

    if (result.success) {
      // Prompt Rule: Redirect Worker → /worker-dashboard, Employer → /employer-dashboard
      if (userType === 'employer') {
        navigate('/employer-dashboard', { replace: true });
      } else {
        navigate('/worker-dashboard', { replace: true });
      }
    } else {
      setFormError(result.error || 'Registration failed. Please try again.');
    }
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
            Create Your KaushalID
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build your verified digital skill identity or verify talent
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User Type Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
              I am joining as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Worker */}
              <button
                type="button"
                onClick={() => setUserType('worker')}
                className={`p-3.5 rounded-2xl border text-left transition relative ${
                  userType === 'worker'
                    ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <HardHat className={`w-5 h-5 mb-2 ${userType === 'worker' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="text-xs font-bold text-slate-900">Worker</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Get Skill Passport & jobs
                </div>
                {userType === 'worker' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-3 right-3" />
                )}
              </button>

              {/* Option 2: Employer */}
              <button
                type="button"
                onClick={() => setUserType('employer')}
                className={`p-3.5 rounded-2xl border text-left transition relative ${
                  userType === 'employer'
                    ? 'border-teal-600 bg-teal-50/70 text-slate-900 ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building2 className={`w-5 h-5 mb-2 ${userType === 'employer' ? 'text-teal-600' : 'text-slate-400'}`} />
                <div className="text-xs font-bold text-slate-900">Employer</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Verify & hire skilled talent
                </div>
                {userType === 'employer' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 absolute top-3 right-3" />
                )}
              </button>
            </div>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rajesh Patil"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Terms note */}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          By signing up, you agree to KaushalID's Terms of Service and Privacy Policy.
        </p>

        {/* Existing user link */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
