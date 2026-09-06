import express from 'express';
import { getWorkers, getWorkerById, updateWorker, getDB, persistDatabase } from '../config/db.js';
import { validateWorkerPricing } from '../services/skillScoring.js';

const router = express.Router();

// Categories endpoint
router.get('/categories/list', (req, res) => {
  const db = getDB();
  res.json(db.categories);
});

// Search & Filter workers
router.get('/', (req, res) => {
  const {
    category,
    city,
    level,
    minScore,
    minExp,
    maxPrice,
    certifiedOnly,
    query,
    sort
  } = req.query;

  const workers = getWorkers({
    category,
    city,
    level,
    minScore,
    minExp,
    maxPrice,
    certifiedOnly,
    query
  }, sort);

  res.json({
    total: workers.length,
    workers
  });
});

// Worker by ID
router.get('/:id', (req, res) => {
  const worker = getWorkerById(req.params.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  const db = getDB();
  const workerReviews = db.reviews.filter(r => r.workerId === worker.id);

  res.json({
    ...worker,
    reviews: workerReviews
  });
});

// Update pricing with fair-pay policy validation
router.put('/:id/pricing', (req, res) => {
  const worker = getWorkerById(req.params.id);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  const { basePrice, inspectionFee } = req.body;
  const numBasePrice = Number(basePrice);

  const validation = validateWorkerPricing(worker.level, numBasePrice);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message, minAllowed: validation.minAllowed });
  }

  const updated = updateWorker(worker.id, {
    pricing: {
      ...worker.pricing,
      basePrice: numBasePrice,
      inspectionFee: inspectionFee !== undefined ? Number(inspectionFee) : worker.pricing.inspectionFee,
      rangeText: `₹${numBasePrice.toLocaleString('en-IN')} – ₹${(numBasePrice + 700).toLocaleString('en-IN')} / ${worker.pricing.unit || 'Service'}`
    }
  });

  res.json({
    message: 'Fair pricing updated successfully.',
    pricing: updated.pricing
  });
});

// Digital Skill Passport Data
router.get('/:id/passport', (req, res) => {
  const worker = getWorkerById(req.params.id);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  const passport = {
    passportId: `SKILL-PASS-${worker.id.toUpperCase()}-${worker.level}`,
    workerName: worker.name,
    specialty: worker.specialty,
    category: worker.category,
    tierLevel: worker.level,
    tierName: worker.tierName,
    badge: worker.badge,
    skillScore: worker.skillScore,
    verifiedJobsCount: worker.jobsCompleted,
    successRate: worker.stats.jobSuccessRate,
    punctualityRate: worker.stats.onTimeRate,
    practicalAssessmentScore: worker.verifications.practicalTestScore,
    practicalTestStatus: worker.verifications.practicalTestPassed ? 'PASSED' : 'PENDING',
    verifications: worker.verifications,
    certifications: worker.certifications,
    skillBreakdown: worker.skillBreakdown,
    qrVerificationUrl: `https://skillserve.org/verify/credential/${worker.id}`,
    qrDataString: `SKILLSERVE_VERIFIED|${worker.id}|${worker.name}|LEVEL_${worker.level}|SCORE_${worker.skillScore}|JOBS_${worker.jobsCompleted}`,
    issuedDate: '2024-01-01',
    validUntil: '2026-12-31'
  };

  res.json(passport);
});

export default router;
