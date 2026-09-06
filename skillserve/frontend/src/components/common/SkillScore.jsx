import { useEffect, useState } from 'react';
import { getSkillScoreColor, getSkillScoreLabel } from '../../utils/helpers';

export default function SkillScore({ score = 0, showLabel = false, size = 'md' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const color = getSkillScoreColor(score);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const sizes = {
    sm: { ring: 36, stroke: 3, text: 'text-xs', radius: 14 },
    md: { ring: 52, stroke: 4, text: 'text-sm', radius: 20 },
    lg: { ring: 72, stroke: 5, text: 'text-lg', radius: 28 },
  };

  const s = sizes[size] || sizes.md;
  const circumference = 2 * Math.PI * s.radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: s.ring, height: s.ring }}>
        <svg width={s.ring} height={s.ring} className="-rotate-90">
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={s.radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={s.radius}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${s.text} font-bold`} style={{ color }}>
            {animatedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500">
          {getSkillScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
