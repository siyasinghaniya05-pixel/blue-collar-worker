import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Target } from 'lucide-react';
import api from '../utils/api';
import SkillBadge from '../components/common/SkillBadge';
import SkillScore from '../components/common/SkillScore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FACTOR_LABELS = {
  practicalTest: 'Practical Skills',
  verifiedExperience: 'Verified Experience',
  jobSuccessRate: 'Job Success Rate',
  customerFeedback: 'Customer Feedback',
  certification: 'Certifications',
  reliability: 'Reliability',
};

export default function SkillProgressPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/workers/skill-progress');
        setProgress(res.data.progress || null);
      } catch (err) {
        console.error('Failed to fetch skill progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading skill progress..." />
      </div>
    );
  }

  const breakdown = progress?.breakdown || {};
  const factors = Object.keys(FACTOR_LABELS).filter((key) => breakdown[key] !== undefined);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Current Skill Status
        </h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <SkillScore score={progress?.currentScore || 0} size="lg" showLabel />
          </div>
          <div>
            <SkillBadge level={progress?.currentLevel || 'basic'} size="lg" />
            {progress?.nextLevel && (
              <p className="text-sm text-gray-500 mt-2">
                {progress.scoreToNextLevel > 0
                  ? `${progress.scoreToNextLevel} points needed to reach ${progress.nextLevel} level`
                  : `Ready to level up to ${progress.nextLevel}!`}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {progress?.currentLevel === 'master'
                ? 'Outstanding! You are among the top professionals.'
                : progress?.currentLevel === 'expert'
                ? 'Excellent work! Keep improving to reach Master level.'
                : progress?.currentLevel === 'skilled'
                ? 'Good progress! Continue developing your skills.'
                : 'Take assessments to improve your skill level.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Star className="w-5 h-5 text-primary-600" />
          Score Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {factors.map((key) => {
            const value = breakdown[key] || 0;
            return (
              <div key={key} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg width="64" height="64" className="-rotate-90">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke={value >= 70 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 - (value / 100) * 2 * Math.PI * 26}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{FACTOR_LABELS[key]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {progress?.improvements?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            Areas to Improve
          </h3>
          <div className="space-y-3">
            {progress.improvements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{item.area}</p>
                  <p className="text-xs text-gray-500">
                    {item.current} → target {item.target}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.suggestion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}