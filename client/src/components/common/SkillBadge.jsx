import React from 'react';
import { ShieldCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SkillBadge({ level = 1, size = 'md', showLabel = true, className = '' }) {
  const configs = {
    1: {
      label: 'Level 1 — Basic',
      shortLabel: 'Basic',
      dotColor: 'bg-emerald-400',
      bgClass: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      icon: CheckCircle2,
      tierEmoji: '🟢'
    },
    2: {
      label: 'Level 2 — Skilled',
      shortLabel: 'Skilled',
      dotColor: 'bg-blue-400',
      bgClass: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]',
      icon: Award,
      tierEmoji: '🔵'
    },
    3: {
      label: 'Level 3 — Expert',
      shortLabel: 'Expert',
      dotColor: 'bg-purple-400',
      bgClass: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
      glow: 'shadow-[0_0_18px_rgba(139,92,246,0.3)]',
      icon: Sparkles,
      tierEmoji: '🟣'
    },
    4: {
      label: 'Level 4 — Master',
      shortLabel: 'Master Verified',
      dotColor: 'bg-amber-400 animate-pulse',
      bgClass: 'bg-gradient-to-r from-amber-950/90 to-amber-900/60 border-amber-400/60 text-amber-200',
      glow: 'shadow-[0_0_22px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/30',
      icon: ShieldCheck,
      tierEmoji: '🟡'
    }
  };

  const current = configs[level] || configs[1];
  const IconComponent = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-xs px-3 py-1.5 gap-2 font-semibold',
    lg: 'text-sm px-4 py-2 gap-2.5 font-bold tracking-wide'
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all duration-300 ${current.bgClass} ${current.glow} ${sizeClasses[size]} ${className}`}
    >
      <span className="text-sm leading-none select-none">{current.tierEmoji}</span>
      <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {showLabel && (
        <span>{size === 'sm' ? current.shortLabel : current.label}</span>
      )}
    </div>
  );
}
