import { getSkillLevelConfig } from '../../utils/helpers';

export default function SkillBadge({ level = 'basic', size = 'md' }) {
  const config = getSkillLevelConfig(level);

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const isMaster = level === 'master';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses[size]} ${
        config.bgColor
      } ${config.color} ${config.borderColor} ${isMaster ? 'animate-pulse-glow' : ''}`}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      {config.label}
    </span>
  );
}
