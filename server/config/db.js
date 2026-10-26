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
  VERIFICATION_REQUESTS,
  CREDENTIALS,
  ASSESSMENT_REQUESTS,
  EMPLOYER_PROFILES,
  AUDIT_LOGS,
  PLATFORM_SETTINGS
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
  verificationRequests: [],
  credentials: [],
  assessmentRequests: [],
  employerProfiles: [],
  auditLogs: [],
  platformSettings: {}
};

// Save to JSON disk file for durability across restarts
export function persistDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database to file:', err.message);
  }
}

// Initialize database with backward compatibility and migration
export function initDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);

      // Backfill KaushalID collections if missing
      if (!Array.isArray(db.credentials) || db.credentials.length === 0) {
        db.credentials = JSON.parse(JSON.stringify(CREDENTIALS));
      }
      if (!Array.isArray(db.assessmentRequests) || db.assessmentRequests.length === 0) {
        db.assessmentRequests = JSON.parse(JSON.stringify(ASSESSMENT_REQUESTS));
      }
      if (!Array.isArray(db.employerProfiles) || db.employerProfiles.length === 0) {
        db.employerProfiles = JSON.parse(JSON.stringify(EMPLOYER_PROFILES));
      }
      if (!Array.isArray(db.auditLogs) || db.auditLogs.length === 0) {
        db.auditLogs = JSON.parse(JSON.stringify(AUDIT_LOGS));
      }
      if (!db.platformSettings || !db.platformSettings.assessmentFee) {
        db.platformSettings = JSON.parse(JSON.stringify(PLATFORM_SETTINGS));
      }

      // Ensure seed users exist in db.users
      USERS.forEach(seedUser => {
        const idx = db.users.findIndex(u => 
          u.email.toLowerCase() === seedUser.email.toLowerCase() ||
          (u.alternateEmails && u.alternateEmails.includes(seedUser.email))
        );
        if (idx === -1) {
          db.users.push(seedUser);
        } else {
          // Merge missing fields
          db.users[idx] = { ...seedUser, ...db.users[idx], role: seedUser.role };
        }
      });

      // Ensure worker w-1 has kaushalId
      const w1 = db.workers.find(w => w.id === 'w-1');
      if (w1) {
        w1.kaushalId = 'KID-IN-MH-10248';
        w1.name = 'Rajesh Patil';
        w1.specialty = 'Senior Electrical Technician';
      }

      persistDatabase();
      console.log(`[Database] Loaded ${db.workers.length} workers, ${db.credentials.length} credentials, and ${db.assessmentRequests.length} assessment requests from storage.`);
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
    verificationRequests: JSON.parse(JSON.stringify(VERIFICATION_REQUESTS)),
    credentials: JSON.parse(JSON.stringify(CREDENTIALS)),
    assessmentRequests: JSON.parse(JSON.stringify(ASSESSMENT_REQUESTS)),
    employerProfiles: JSON.parse(JSON.stringify(EMPLOYER_PROFILES)),
    auditLogs: JSON.parse(JSON.stringify(AUDIT_LOGS)),
    platformSettings: JSON.parse(JSON.stringify(PLATFORM_SETTINGS))
  };
  persistDatabase();
  console.log('[Database] Re-seeded with standard KaushalID master dataset.');
}

export const getDB = () => db;

// ==========================================
// Worker Operations
// ==========================================
export function getWorkers(filters = {}, sort = 'skillScore') {
  let list = [...db.workers];

  if (filters.category || filters.trade) {
    const target = (filters.category || filters.trade).toLowerCase();
    list = list.filter(w => 
      (w.category && w.category.toLowerCase() === target) ||
      (w.specialty && w.specialty.toLowerCase().includes(target)) ||
      (w.occupation && w.occupation.toLowerCase().includes(target))
    );
  }

  if (filters.city) {
    list = list.filter(w => w.city && w.city.toLowerCase().includes(filters.city.toLowerCase()));
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

  if (filters.maxPrice && filters.maxPrice !== 'undefined') {
    list = list.filter(w => w.pricing?.basePrice <= Number(filters.maxPrice));
  }

  if (filters.certifiedOnly === 'true' || filters.certifiedOnly === true) {
    list = list.filter(w => w.verifications?.certificationVerified && w.certifications?.length > 0);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(w => 
      (w.name && w.name.toLowerCase().includes(q)) ||
      (w.specialty && w.specialty.toLowerCase().includes(q)) ||
      (w.category && w.category.toLowerCase().includes(q)) ||
      (w.kaushalId && w.kaushalId.toLowerCase().includes(q)) ||
      (w.bio && w.bio.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'skillScore' || sort === 'highestScore') {
    list.sort((a, b) => b.skillScore - a.skillScore);
  } else if (sort === 'experience' || sort === 'mostExperienced') {
    list.sort((a, b) => b.experienceYears - a.experienceYears);
  } else if (sort === 'priceAsc' || sort === 'lowestPrice') {
    list.sort((a, b) => (a.pricing?.basePrice || 0) - (b.pricing?.basePrice || 0));
  } else if (sort === 'successRate') {
    list.sort((a, b) => (b.stats?.jobSuccessRate || 0) - (a.stats?.jobSuccessRate || 0));
  } else if (sort === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return list;
}

export function getWorkerById(id) {
  return db.workers.find(w => w.id === id || w.userId === id || w.kaushalId === id);
}

export function updateWorker(id, updates) {
  const index = db.workers.findIndex(w => w.id === id || w.userId === id || w.kaushalId === id);
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
    practicalTestScore: worker.verifications?.practicalTestScore || 70,
    experienceYears: worker.experienceYears || 1,
    jobSuccessRate: worker.stats?.jobSuccessRate || 90,
    customerRating: worker.rating || 4.0,
    certificationsCount: worker.certifications?.length || 0,
    onTimeRate: worker.stats?.onTimeRate || 90
  });

  worker.skillScore = result.skillScore;
  worker.level = result.level;
  worker.tierName = result.levelName;
  worker.badge = result.badge;

  persistDatabase();
  return worker;
}

// ==========================================
// Credential & Passport Operations
// ==========================================
export function getCredentialById(id) {
  if (!id) return null;
  const cleanId = id.trim().toUpperCase();
  return db.credentials.find(c => 
    c.id.toUpperCase() === cleanId || 
    (c.credentialId && c.credentialId.toUpperCase() === cleanId) || 
    (c.passportId && c.passportId.toUpperCase() === cleanId) ||
    c.workerId === id
  );
}

export function createCredential(credData) {
  db.credentials.push(credData);
  persistDatabase();
  return credData;
}

export function updateCredential(id, updates) {
  const cleanId = id.trim().toUpperCase();
  const index = db.credentials.findIndex(c => 
    c.id.toUpperCase() === cleanId || 
    (c.credentialId && c.credentialId.toUpperCase() === cleanId) || 
    (c.passportId && c.passportId.toUpperCase() === cleanId)
  );
  if (index === -1) return null;

  db.credentials[index] = {
    ...db.credentials[index],
    ...updates
  };
  persistDatabase();
  return db.credentials[index];
}

// ==========================================
// Assessment Request Operations
// ==========================================
export function getAssessmentRequests(filter = {}) {
  let list = [...db.assessmentRequests];
  if (filter.workerId) {
    list = list.filter(r => r.workerId === filter.workerId || r.kaushalId === filter.workerId);
  }
  if (filter.status) {
    list = list.filter(r => r.status.toLowerCase() === filter.status.toLowerCase());
  }
  return list;
}

export function getAssessmentRequestById(id) {
  return db.assessmentRequests.find(r => r.id === id);
}

export function createAssessmentRequest(reqData) {
  db.assessmentRequests.unshift(reqData);
  persistDatabase();
  return reqData;
}

export function updateAssessmentRequest(id, updates) {
  const index = db.assessmentRequests.findIndex(r => r.id === id);
  if (index === -1) return null;

  db.assessmentRequests[index] = {
    ...db.assessmentRequests[index],
    ...updates
  };
  persistDatabase();
  return db.assessmentRequests[index];
}

// ==========================================
// Employer Operations
// ==========================================
export function getEmployerProfile(userId) {
  let profile = db.employerProfiles.find(p => p.userId === userId);
  if (!profile && userId) {
    profile = {
      id: `emp-${Date.now()}`,
      userId,
      companyName: 'Registered Employer',
      companyId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      industry: 'General Contractor',
      city: 'India',
      savedWorkers: [],
      subscription: {
        status: 'Active',
        plan: 'Standard Plan',
        price: 999,
        validUntil: '2027-12-31',
        verificationCredits: 25
      },
      verificationHistory: []
    };
    db.employerProfiles.push(profile);
    persistDatabase();
  }
  return profile;
}

export function updateEmployerProfile(userId, updates) {
  const profile = getEmployerProfile(userId);
  if (!profile) return null;

  const index = db.employerProfiles.findIndex(p => p.userId === userId || p.id === profile.id);
  if (index === -1) return null;

  db.employerProfiles[index] = {
    ...db.employerProfiles[index],
    ...updates,
    subscription: { ...db.employerProfiles[index].subscription, ...(updates.subscription || {}) }
  };
  persistDatabase();
  return db.employerProfiles[index];
}

// ==========================================
// Audit Log Operations
// ==========================================
export function logAuditEvent(actor, action, targetEntity, targetId, details) {
  const logEntry = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId: actor?.id || 'system',
    actorName: actor?.name || 'System Auditor',
    actorRole: actor?.role || 'system',
    action,
    targetEntity,
    targetId,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(logEntry);
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop(); // Keep bounded log size
  }
  persistDatabase();
  return logEntry;
}

export function getAuditLogs(limit = 100) {
  return db.auditLogs.slice(0, limit);
}

// ==========================================
// Platform Settings
// ==========================================
export function getPlatformSettings() {
  return db.platformSettings || PLATFORM_SETTINGS;
}

export function updatePlatformSettings(updates) {
  db.platformSettings = {
    ...db.platformSettings,
    ...updates
  };
  persistDatabase();
  return db.platformSettings;
}
