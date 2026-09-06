import express from 'express';
import { getDB, getWorkerById, recalculateWorkerScore, resetDatabase, persistDatabase } from '../config/db.js';

const router = express.Router();

// Executive statistics & KPIs
router.get('/stats', (req, res) => {
  const db = getDB();

  const totalWorkers = db.workers.length;
  const verifiedWorkers = db.workers.filter(w => w.verifications.identityVerified && w.verifications.practicalTestPassed).length;
  const masterWorkers = db.workers.filter(w => w.level === 4).length;
  const expertWorkers = db.workers.filter(w => w.level === 3).length;
  const skilledWorkers = db.workers.filter(w => w.level === 2).length;
  const basicWorkers = db.workers.filter(w => w.level === 1).length;

  const totalCustomers = db.users.filter(u => u.role === 'customer').length;
  const completedJobs = db.bookings.filter(b => b.status === 'Job Completed').length;
  const totalRevenue = db.bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
  const workerEarnings = Math.round(totalRevenue * 0.85); // 85% paid to workers

  const avgSkillScore = Math.round(db.workers.reduce((sum, w) => sum + w.skillScore, 0) / (totalWorkers || 1));

  // Category distribution
  const categoryStats = db.categories.map(c => ({
    name: c.name,
    count: db.workers.filter(w => w.category === c.name).length
  }));

  // Skill Score Distribution
  const scoreDistribution = [
    { range: '90-100 (Master)', count: masterWorkers, fill: '#F59E0B' },
    { range: '80-89 (Expert)', count: expertWorkers, fill: '#8B5CF6' },
    { range: '65-79 (Skilled)', count: skilledWorkers, fill: '#3B82F6' },
    { range: '0-64 (Basic)', count: basicWorkers, fill: '#10B981' }
  ];

  res.json({
    kpis: {
      totalWorkers,
      verifiedWorkers,
      masterWorkers,
      totalCustomers,
      completedJobs,
      totalRevenue,
      workerEarnings,
      avgSkillScore
    },
    categoryStats,
    scoreDistribution,
    pendingVerifications: db.verificationRequests.filter(v => v.status === 'Pending Review').length
  });
});

// Verification requests list
router.get('/verifications', (req, res) => {
  const db = getDB();
  res.json(db.verificationRequests);
});

// Approve or reject verification request
router.put('/verifications/:id', (req, res) => {
  const { status, notes } = req.body; // 'Approved' or 'Rejected'
  const db = getDB();

  const reqItem = db.verificationRequests.find(v => v.id === req.params.id);
  if (!reqItem) {
    return res.status(404).json({ error: 'Verification request not found' });
  }

  reqItem.status = status;
  reqItem.reviewedAt = new Date().toISOString();
  reqItem.adminNotes = notes || (status === 'Approved' ? 'Documents and field record verified.' : 'Insufficient proof.');

  // If approved, upgrade worker tier
  if (status === 'Approved') {
    const worker = getWorkerById(reqItem.workerId);
    if (worker) {
      if (reqItem.requestedTier === 'Master') {
        worker.level = 4;
        worker.tierName = 'Master';
        worker.badge = '🟡 MASTER VERIFIED';
        worker.verifications.certificationVerified = true;
      } else if (reqItem.requestedTier === 'Expert') {
        worker.level = 3;
        worker.tierName = 'Expert';
        worker.badge = '🟣 EXPERT';
        worker.verifications.certificationVerified = true;
      } else if (reqItem.requestedTier === 'Skilled') {
        worker.level = 2;
        worker.tierName = 'Skilled';
        worker.badge = '🔵 SKILLED';
      }
      recalculateWorkerScore(worker.id);
    }
  }

  persistDatabase();

  res.json({
    message: `Verification request ${status.toLowerCase()} successfully.`,
    request: reqItem
  });
});

// Reset database to initial seed data
router.post('/reset-database', (req, res) => {
  resetDatabase();
  res.json({ message: 'Database reset to initial demo state.' });
});

export default router;
