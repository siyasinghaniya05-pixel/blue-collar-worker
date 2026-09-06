export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function getSkillLevelConfig(level) {
  const configs = {
    basic: {
      label: 'Basic',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      ringColor: 'ring-gray-200',
      icon: '🔰',
      description: 'Entry-level skills with foundational knowledge',
    },
    skilled: {
      label: 'Skilled',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      ringColor: 'ring-blue-200',
      icon: '⚡',
      description: 'Proven competence with hands-on experience',
    },
    expert: {
      label: 'Expert',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      ringColor: 'ring-purple-200',
      icon: '💎',
      description: 'Advanced expertise with excellent track record',
    },
    master: {
      label: 'Master',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      ringColor: 'ring-yellow-300',
      icon: '👑',
      description: 'Top-tier mastery with exceptional performance',
    },
  };
  return configs[level] || configs.basic;
}

export function getSkillScoreColor(score) {
  if (score < 40) return '#EF4444';
  if (score < 60) return '#F97316';
  if (score < 80) return '#3B82F6';
  return '#10B981';
}

export function getSkillScoreLabel(score) {
  if (score < 40) return 'Needs Improvement';
  if (score < 60) return 'Developing';
  if (score < 80) return 'Proficient';
  return 'Excellent';
}

export function truncateText(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

export function generatePassportId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SP-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || `${singular}s`;
}

export function calculateSuccessRate(completed, total) {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
}
