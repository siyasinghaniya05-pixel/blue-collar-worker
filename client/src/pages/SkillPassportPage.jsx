import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkillPassportCard from '../components/common/SkillPassportCard';
import { ShieldCheck, ArrowLeft, Printer, Share2 } from 'lucide-react';

export default function SkillPassportPage() {
  const { id } = useParams();
  const { user } = useAuth();

  // If viewing own passport or specific ID
  const isSelf = !id || id === user?.kaushalId;
  const isVerified = user?.verifiedStatus === 'verified' && Boolean(user?.kaushalId);

  const workerData = isSelf && user && isVerified ? {
    displayName: user.displayName || user.name || 'Skilled Craftsman',
    kaushalId: user.kaushalId,
    trade: user.trade || 'Tradesperson',
    city: user.city || 'Not Specified',
    experienceYears: user.experienceYears || 0,
    verifiedStatus: user.verifiedStatus,
    verificationLevel: user.verificationLevel || 'Level 2 - Skilled',
    verificationDate: user.verificationDate || 'Recently Verified',
    completionRate: user.completionRate || 90,
    skills: user.skills || [],
    certifications: user.certifications || [],
    workHistory: user.workHistory || []
  } : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation & Print Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={user?.role === 'employer' ? '/employer-dashboard' : '/worker-dashboard'}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Passport</span>
          </button>
        </div>

        {/* The Digital Passport Card */}
        <div className="pt-2">
          <SkillPassportCard
            worker={workerData}
            interactive={true}
            showFullDetails={true}
          />
        </div>

      </div>
    </div>
  );
}
