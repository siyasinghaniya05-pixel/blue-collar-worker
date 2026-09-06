/**
 * SkillServe Smart Matching Engine
 * Recommends best-fit tiered workers based on problem diagnosis, complexity, location, and skill metrics
 */

export const PROBLEM_DIAGNOSES = [
  {
    id: 'ac-not-cooling',
    title: 'AC Not Cooling / Low Airflow',
    category: 'AC Technicians',
    complexity: 'High',
    requiredSkills: ['Refrigerant Diagnosis', 'Compressor Testing', 'Airflow Optimization'],
    recommendedTier: 4, // Master or Expert recommended for compressor/cooling
    typicalIssue: 'Potential refrigerant leak, failed capacitor, or clogged coil'
  },
  {
    id: 'short-circuit-tripping',
    title: 'Frequent Circuit Breaker Tripping / Sparking',
    category: 'Electricians',
    complexity: 'High',
    requiredSkills: ['Electrical Diagnosis', 'Circuit Troubleshooting', 'Safety Standards'],
    recommendedTier: 4,
    typicalIssue: 'Overloaded circuit, neutral fault, or damaged wire insulation'
  },
  {
    id: 'ceiling-leakage',
    title: 'Concealed Pipe Seepage & Low Pressure',
    category: 'Plumbers',
    complexity: 'High',
    requiredSkills: ['Pressure Testing', 'Concealed Pipe Detection', 'Leakage Sealing'],
    recommendedTier: 3,
    typicalIssue: 'Damaged main junction or corroded CPVC fitting behind tile'
  },
  {
    id: 'custom-furniture',
    title: 'Custom Modular Wardrobe & Hinge Alignment',
    category: 'Carpenters',
    complexity: 'Medium',
    requiredSkills: ['Precision Joinery', 'Hardware Fitting', 'Laminate Finishing'],
    recommendedTier: 3,
    typicalIssue: 'Requires millimetric measurement and heavy duty concealed hinges'
  },
  {
    id: 'refrigerator-noise',
    title: 'Refrigerator Making Loud Humming / Freezer Frost',
    category: 'Appliance Repair Technicians',
    complexity: 'Medium',
    requiredSkills: ['Defrost Timer Diagnosis', 'Evaporator Fan Repair', 'Thermostat Calibration'],
    recommendedTier: 2,
    typicalIssue: 'Faulty defrost heater or blocked fan blade assembly'
  },
  {
    id: 'deep-home-cleaning',
    title: 'Post-Renovation Deep Villa Cleaning & Sanitization',
    category: 'Cleaning Professionals',
    complexity: 'Medium',
    requiredSkills: ['Industrial Scrubbing', 'Tile Acid Treatment', 'Steam Disinfection'],
    recommendedTier: 2,
    typicalIssue: 'Stubborn paint residue, grout restoration, and dust extraction'
  },
  {
    id: 'react-fullstack-bug',
    title: 'Production API Latency & React Hydration Bug',
    category: 'Web Developers',
    complexity: 'High',
    requiredSkills: ['React Architecture', 'Node.js Profiling', 'Database Indexing'],
    recommendedTier: 4,
    typicalIssue: 'Memory leaks and unindexed queries during peak traffic'
  }
];

/**
 * Match workers against customer query
 */
export function matchWorkers(workers, criteria) {
  const {
    problemId,
    category,
    location,
    maxBudget,
    urgency = 'any'
  } = criteria;

  const diagnosis = PROBLEM_DIAGNOSES.find(p => p.id === problemId);
  const targetCategory = diagnosis ? diagnosis.category : (category || 'Electricians');

  // Filter workers in this category
  let candidates = workers.filter(w => {
    const matchesCategory = w.category.toLowerCase() === targetCategory.toLowerCase() ||
      w.specialty.toLowerCase().includes(targetCategory.toLowerCase());
    return matchesCategory;
  });

  if (candidates.length === 0) {
    // Fallback: relax category to closest
    candidates = workers.slice(0, 6);
  }

  // Score each candidate
  const scoredCandidates = candidates.map(worker => {
    let matchScore = 0;
    const reasons = [];

    // 1. Skill Score impact (up to 40 pts)
    const scoreContrib = (worker.skillScore / 100) * 40;
    matchScore += scoreContrib;
    if (worker.skillScore >= 90) {
      reasons.push(`Top 5% verified skill score (${worker.skillScore}/100)`);
    }

    // 2. Tier relevance to complexity (up to 25 pts)
    if (diagnosis) {
      if (diagnosis.complexity === 'High') {
        if (worker.level === 4) {
          matchScore += 25;
          reasons.push('Master tier credential ideal for complex high-risk troubleshooting');
        } else if (worker.level === 3) {
          matchScore += 20;
          reasons.push('Expert practical test certification meets complexity requirement');
        } else {
          matchScore += 10;
        }
      } else {
        if (worker.level >= 2) matchScore += 20;
      }
    } else {
      matchScore += (worker.level * 5);
    }

    // 3. Location proximity (up to 20 pts)
    if (location && worker.city && worker.city.toLowerCase().includes(location.toLowerCase())) {
      matchScore += 20;
      reasons.push(`Located directly in ${worker.city} for rapid arrival`);
    } else {
      matchScore += 10; // general proximity
    }

    // 4. Job Success & On-time reliability (up to 15 pts)
    if (worker.stats.jobSuccessRate >= 95) {
      matchScore += 10;
      reasons.push(`${worker.stats.jobSuccessRate}% verified job completion rate`);
    }
    if (worker.stats.onTimeRate >= 95) {
      matchScore += 5;
      reasons.push(`${worker.stats.onTimeRate}% on-time arrival record`);
    }

    // Budget match note
    if (maxBudget && worker.pricing.basePrice <= maxBudget) {
      reasons.push(`Within your budget of ₹${maxBudget}`);
    }

    return {
      ...worker,
      matchScore: Math.min(99, Math.round(matchScore)),
      recommendationReasons: reasons.slice(0, 3),
      diagnosisMatched: diagnosis ? diagnosis.title : 'General Request'
    };
  });

  // Sort by match score descending
  scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

  // Pick top 3 ensuring tier diversity if available (e.g. Master, Expert, Skilled)
  const masterMatch = scoredCandidates.find(w => w.level === 4);
  const expertMatch = scoredCandidates.find(w => w.level === 3);
  const skilledMatch = scoredCandidates.find(w => w.level === 2);

  const diverseMatches = [masterMatch, expertMatch, skilledMatch].filter(Boolean);

  // If we have less than 3, pad with top scorers
  for (const c of scoredCandidates) {
    if (diverseMatches.length >= 3) break;
    if (!diverseMatches.some(w => w.id === c.id)) {
      diverseMatches.push(c);
    }
  }

  return {
    diagnosis: diagnosis || {
      id: 'custom',
      title: `${targetCategory} Inspection & Repair`,
      category: targetCategory,
      complexity: 'Standard'
    },
    recommendations: diverseMatches.length > 0 ? diverseMatches : scoredCandidates.slice(0, 3)
  };
}
