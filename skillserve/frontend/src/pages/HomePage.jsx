import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, ClipboardCheck, TrendingUp, ArrowRight, Star, Users, Zap } from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';

const features = [
  {
    icon: ClipboardCheck,
    title: 'Skill-Based Assessment',
    description: 'Every professional takes a rigorous practical skill assessment. No fake reviews, no paid rankings.',
    color: 'bg-blue-500',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Professionals',
    description: 'Identity, experience, and background checks. Only verified workers make it to our platform.',
    color: 'bg-green-500',
  },
  {
    icon: TrendingUp,
    title: 'Skill Score',
    description: 'A transparent, data-driven score that reflects actual competence, not customer mood.',
    color: 'bg-purple-500',
  },
];

const skillLevels = [
  { level: 'basic', label: 'Basic', description: 'Entry-level with foundational knowledge', count: '2,400+' },
  { level: 'skilled', label: 'Skilled', description: 'Proven competence with experience', count: '1,800+' },
  { level: 'expert', label: 'Expert', description: 'Advanced expertise, excellent record', count: '800+' },
  { level: 'master', label: 'Master', description: 'Top-tier mastery, exceptional work', count: '200+' },
];

const stats = [
  { value: '10,000+', label: 'Verified Professionals' },
  { value: '50,000+', label: 'Jobs Completed' },
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '4.8', label: 'Average Rating' },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                <Zap className="w-4 h-4 text-yellow-300" />
                Skill-Based Hiring Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Hire by Skill,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">
                  Not Stars
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-primary-100 leading-relaxed mb-8 max-w-2xl">
                5 stars tell you what customers think. A Skill Score shows what they can actually do.
                Find verified professionals based on proven competence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-xl hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                Find Workers
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Join as Professional
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="h-16 bg-gradient-to-b from-transparent to-gray-50" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why SkillServe is Different
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We replaced unreliable star ratings with a transparent skill scoring system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Skill Levels Explained</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every professional is categorized based on their verified skill assessment score
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillLevels.map((item, i) => (
              <motion.div
                key={item.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`skill-level-card ${item.level}`}
              >
                <SkillBadge level={item.level} size="lg" />
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{item.description}</p>
                <p className="text-2xl font-bold text-gray-900 mt-4">{item.count}</p>
                <p className="text-xs text-gray-500">Professionals</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-10 lg:p-16 text-white text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Find Skilled Professionals?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Skip the guesswork. Book verified professionals based on proven skill scores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-xl hover:shadow-xl transition-all"
              >
                <Search className="w-5 h-5" />
                Search Workers
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
              >
                Register as Professional
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
