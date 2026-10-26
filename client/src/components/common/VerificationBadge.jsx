import React from 'react';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';

export default function VerificationBadge({ 
  level = 'Level 3 - Master', 
  status = 'verified', 
  showText = true, 
  size = 'md',
  date
}) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all ${
        status === 'verified'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
          : 'bg-amber-50 text-amber-700 border border-amber-200/80'
      } ${
        isSmall 
          ? 'px-2 py-0.5 text-[11px]' 
          : isLarge 
          ? 'px-3.5 py-1.5 text-sm' 
          : 'px-2.5 py-1 text-xs'
      }`}
      title={date ? `Verified on ${date}` : 'Verified via KaushalID Assessment'}
    >
      <ShieldCheck className={isSmall ? 'w-3 h-3 text-emerald-600' : isLarge ? 'w-4 h-4 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
      {showText && (
        <span className="tracking-tight">
          {status === 'verified' ? 'Kaushal Verified' : 'Pending Verification'}
        </span>
      )}
      {level && !isSmall && (
        <span className="text-emerald-500 font-normal border-l border-emerald-200 pl-1.5 text-[11px]">
          {level.split('-')[0]}
        </span>
      )}
    </div>
  );
}
