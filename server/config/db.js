import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  USERS,
  WORKERS,
  CATEGORIES,
  ASSESSMENTS,
  BOOKINGS,
  REVIEWS,
  VERIFICATION_REQUESTS
} from '../data/seedData.js';
import { calculateSkillScore } from '../services/skillScoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');

// In-memory runtime cache
let db = {
  users: [],
  workers: [],
  categories: [],
  assessments: [],
  bookings: [],
  reviews: [],
  verificationRequests: []
};

// Save to JSON disk file for durability across restarts
export function persistDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database to file:', err.message);
  }
}

// Initialize database
export function initDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      console.log(`[Database] Loaded ${db.workers.length} workers and ${db.bookings.length} bookings from storage.`);
    } else {
      resetDatabase();
    }
  } catch (err) {
    console.warn('[Database] Storage load warning, resetting with seed data:', err.message);
    resetDatabase();
  }
}

export function resetDatabase() {
  db = {
    users: JSON.parse(JSON.stringify(USERS)),
    workers: JSON.parse(JSON.stringify(WORKERS)),
    categories: JSON.parse(JSON.stringify(CATEGORIES)),
    assessments: JSON.parse(JSON.stringify(ASSESSMENTS)),
    bookings: JSON.parse(JSON.stringify(BOOKINGS)),
    reviews: JSON.parse(JSON.stringify(REVIEWS)),
    verificationRequests: JSON.parse(JSON.stringify(VERIFICATION_REQUESTS))
  };
  persistDatabase();
  console.log('[Database] Re-seeded with standard SkillServe master dataset.');
}

export const getDB = () => db;

// Worker operations
export function getWorkers(filters = {}, sort = 'skillScore') {
  let list = [...db.workers];

  if (filters.category) {
    list = list.filter(w => 
      w.category.toLowerCase() === filters.category.toLowerCase() ||
      w.specialty.toLowerCase().includes(filters.category.toLowerCase())
    );
  }

  if (filters.city) {
    list = list.filter(w => w.city.toLowerCase().includes(filters.city.toLowerCase()));
  }

  if (filters.level) {
    const levels = Array.isArray(filters.level) ? filters.level.map(Number) : [Number(filters.level)];
    list = list.filter(w => levels.includes(w.level));
  }

  if (filters.minScore) {
    list = list.filter(w => w.skillScore >= Number(filters.minScore));
  }

  if (filters.minExp) {
    list = list.filter(w => w.experienceYears >= Number(filters.minExp));
  }

  if (filters.maxPrice) {
    list = list.filter(w => w.pricing.basePrice <= Number(filters.maxPrice));
  }

  if (filters.certifiedOnly === 'true' || filters.certifiedOnly === true) {
    list = list.filter(w => w.verifications.certificationVerified && w.certifications.length > 0);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(w => 
      w.name.toLowerCase().includes(q) ||
      w.specialty.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.bio.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'skillScore' || sort === 'highestScore') {
    list.sort((a, b) => b.skillScore - a.skillScore);
  } else if (sort === 'experience' || sort === 'mostExperienced') {
    list.sort((a, b) => b.experienceYears - a.experienceYears);
  } else if (sort === 'priceAsc' || sort === 'lowestPrice') {
    list.sort((a, b) => a.pricing.basePrice - b.pricing.basePrice);
  } else if (sort === 'successRate') {
    list.sort((a, b) => b.stats.jobSuccessRate - a.stats.jobSuccessRate);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

export function getWorkerById(id) {
  return db.workers.find(w => w.id === id || w.userId === id);
}

export function updateWorker(id, updates) {
  const index = db.workers.findIndex(w => w.id === id || w.userId === id);
  if (index === -1) return null;

  db.workers[index] = {
    ...db.workers[index],
    ...updates,
    pricing: { ...db.workers[index].pricing, ...(updates.pricing || {}) },
    stats: { ...db.workers[index].stats, ...(updates.stats || {}) },
    verifications: { ...db.workers[index].verifications, ...(updates.verifications || {}) }
  };

  persistDatabase();
  return db.workers[index];
}

export function recalculateWorkerScore(workerId) {
  const worker = getWorkerById(workerId);
  if (!worker) return null;

  const result = calculateSkillScore({
    practicalTestScore: worker.verifications.practicalTestScore || 70,
    experienceYears: worker.experienceYears || 1,
    jobSuccessRate: worker.stats.jobSuccessRate || 90,
    customerRating: worker.rating || 4.0,
    certificationsCount: worker.certifications?.length || 0,
    onTimeRate: worker.stats.onTimeRate || 90
  });

  worker.skillScore = result.skillScore;
  worker.level = result.level;
  worker.tierName = result.levelName;
  worker.badge = result.badge;
  worker.scoreComponents = {
    practicalTest: { score: result.breakdown.practicalTest.raw, weight: '40%', points: result.breakdown.practicalTest.points },
    verifiedExperience: { score: result.breakdown.verifiedExperience.raw, weight: '20%', points: result.breakdown.verifiedExperience.points },
    jobSuccessRate: { score: result.breakdown.jobSuccessRate.raw, weight: '15%', points: result.breakdown.jobSuccessRate.points },
    customerFeedback: { score: result.breakdown.customerFeedback.raw, weight: '10%', points: result.breakdown.customerFeedback.points },
    certifications: { score: result.breakdown.certifications.raw, weight: '10%', points: result.breakdown.certifications.points },
    reliability: { score: result.breakdown.reliability.raw, weight: '5%', points: result.breakdown.reliability.points }
  };

  persistDatabase();
  return worker;
}
