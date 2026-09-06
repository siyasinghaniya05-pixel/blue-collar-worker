/**
 * SkillServe Skill Scoring & Tier Engine
 * 
 * Formula (0-100):
 * - Practical Test: 40%
 * - Verified Experience: 20%
 * - Job Success Rate: 15%
 * - Customer Feedback: 10%
 * - Certification: 10%
 * - Reliability/Punctuality: 5%
 */

export const TIER_CONFIG = {
  BASIC: {
    level: 1,
    name: 'Basic',
    color: '#10B981',
    badge: '🟢 BASIC',
    minScore: 0,
    maxScore: 64,
    minPrice: 299,
    description: 'Beginner • Basic skill assessment passed • Limited experience • Entry-level pricing'
  },
  SKILLED: {
    level: 2,
    name: 'Skilled',
    color: '#3B82F6',
    badge: '🔵 SKILLED',
    minScore: 65,
    maxScore: 79,
    minPrice: 499,
    description: 'Practical assessment passed • Verified experience • Good customer performance • Medium pricing'
  },
  EXPERT: {
    level: 3,
    name: 'Expert',
    color: '#8B5CF6',
    badge: '🟣 EXPERT',
    minScore: 80,
    maxScore: 89,
    minPrice: 799,
    description: 'Advanced practical assessment • Strong experience • Multiple verified jobs • High satisfaction • Premium pricing'
  },
  MASTER: {
    level: 4,
    name: 'Master',
    color: '#F59E0B',
    badge: '🟡 MASTER VERIFIED',
    minScore: 90,
    maxScore: 100,
    minPrice: 1199,
    description: 'Highest practical assessment • Extensive experience • Exceptional performance • Industry certified • Top Verified'
  }
};

/**
 * Calculate transparent Skill Score from parameters
 * @param {Object} metrics 
 * @returns {Object} breakdown & total score & tier
 */
export function calculateSkillScore(metrics) {
  const {
    practicalTestScore = 70, // 0-100
    experienceYears = 2,     // capped at 10 years for 100%
    jobSuccessRate = 90,     // 0-100 %
    customerRating = 4.0,    // 0-5.0 scale -> 0-100%
    certificationsCount = 1, // 0-3+ -> 0-100%
    onTimeRate = 90          // 0-100 %
  } = metrics;

  // 1. Practical Test (40%)
  const testPart = Math.min(100, Math.max(0, practicalTestScore)) * 0.40;

  // 2. Verified Experience (20%) -> 10 years = 100%
  const experiencePercentage = Math.min(100, (experienceYears / 10) * 100);
  const expPart = experiencePercentage * 0.20;

  // 3. Job Success Rate (15%)
  const successPart = Math.min(100, Math.max(0, jobSuccessRate)) * 0.15;

  // 4. Customer Feedback (10%) -> 5.0 = 100%
  const feedbackPercentage = Math.min(100, (customerRating / 5.0) * 100);
  const feedbackPart = feedbackPercentage * 0.10;

  // 5. Certification (10%) -> 2+ verified certs = 100%, 1 cert = 70%
  const certPercentage = certificationsCount >= 2 ? 100 : certificationsCount === 1 ? 70 : 30;
  const certPart = certPercentage * 0.10;

  // 6. Reliability/Punctuality (5%)
  const reliabilityPart = Math.min(100, Math.max(0, onTimeRate)) * 0.05;

  const totalScore = Math.round(testPart + expPart + successPart + feedbackPart + certPart + reliabilityPart);

  // Determine Tier
  let tierKey = 'BASIC';
  if (totalScore >= 90 && certificationsCount >= 1 && practicalTestScore >= 88) {
    tierKey = 'MASTER';
  } else if (totalScore >= 80) {
    tierKey = 'EXPERT';
  } else if (totalScore >= 65) {
    tierKey = 'SKILLED';
  }

  const tier = TIER_CONFIG[tierKey];

  return {
    skillScore: totalScore,
    tierKey,
    level: tier.level,
    levelName: tier.name,
    badge: tier.badge,
    color: tier.color,
    minRecommendedPrice: tier.minPrice,
    breakdown: {
      practicalTest: {
        raw: practicalTestScore,
        weight: '40%',
        points: Math.round(testPart * 10) / 10
      },
      verifiedExperience: {
        raw: `${experienceYears} Years`,
        weight: '20%',
        points: Math.round(expPart * 10) / 10
      },
      jobSuccessRate: {
        raw: `${jobSuccessRate}%`,
        weight: '15%',
        points: Math.round(successPart * 10) / 10
      },
      customerFeedback: {
        raw: `${customerRating}/5.0`,
        weight: '10%',
        points: Math.round(feedbackPart * 10) / 10
      },
      certifications: {
        raw: `${certificationsCount} Verified`,
        weight: '10%',
        points: Math.round(certPart * 10) / 10
      },
      reliability: {
        raw: `${onTimeRate}% On-Time`,
        weight: '5%',
        points: Math.round(reliabilityPart * 10) / 10
      }
    }
  };
}

/**
 * Validates worker defined pricing against tier minimums
 */
export function validateWorkerPricing(level, proposedPrice) {
  let minAllowed = 299;
  if (level === 4) minAllowed = 1199;
  else if (level === 3) minAllowed = 799;
  else if (level === 2) minAllowed = 499;

  return {
    isValid: proposedPrice >= minAllowed,
    minAllowed,
    message: proposedPrice < minAllowed 
      ? `Level ${level} fair pricing policy requires a minimum of ₹${minAllowed} to protect skilled worker earnings.`
      : 'Pricing approved within platform fair-pay guidelines.'
  };
}
