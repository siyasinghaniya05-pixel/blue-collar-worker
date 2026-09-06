import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, IndianRupee, Briefcase, CheckCircle2 } from 'lucide-react';
import SkillBadge from './SkillBadge';
import SkillScore from './SkillScore';
import VerificationBadge from './VerificationBadge';
import { getInitials, formatCurrency, pluralize, truncateText } from '../../utils/helpers';

export default function WorkerCard({ worker }) {
  const navigate = useNavigate();

  const user = worker.user || worker;
  const profile = worker.workerProfile || user.workerProfile || worker;

  const name = user.name || 'Unknown Worker';
  const category = profile.category || 'General';
  const experience = profile.experience || 0;
  const hourlyRate = profile.hourlyRate || profile.pricing?.hourly || 0;
  const skillScore = profile.skillScore || 0;
  const skillLevel = profile.skillLevel || 'basic';
  const jobsCompleted = profile.completedJobs || profile.stats?.completedJobs || 0;
  const successRate = profile.successRate || profile.stats?.successRate || 0;
  const satisfaction = profile.satisfaction || profile.stats?.satisfaction || 0;
  const location = user.location || profile.location || '';
  const verifications = profile.verifications || {};

  const handleCardClick = () => {
    navigate(`/workers/${worker._id || user._id}`);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    navigate(`/bookings/new?worker=${worker._id || user._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {getInitials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {name}
              </h3>
              {verifications.identity && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {category} • {experience} {pluralize(experience, 'year', 'years')} exp
            </p>
            {location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {location}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <SkillBadge level={skillLevel} size="md" />
          <SkillScore score={skillScore} size="md" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <VerificationBadge verifications={verifications} compact />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5 py-3 border-t border-gray-50">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{jobsCompleted}</p>
            <p className="text-xs text-gray-500">Jobs Done</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{successRate}%</p>
            <p className="text-xs text-gray-500">Success</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{satisfaction}%</p>
            <p className="text-xs text-gray-500">Satisfaction</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Starting at</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-0.5">
              <IndianRupee className="w-4 h-4" />
              {formatCurrency(hourlyRate)}
              <span className="text-xs font-normal text-gray-400">/hr</span>
            </p>
          </div>
          <button
            onClick={handleBookClick}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl gradient-primary hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 active:scale-[0.98]"
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
