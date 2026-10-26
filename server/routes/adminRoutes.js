import express from 'express';
import { 
  getDB, 
  getWorkerById, 
  recalculateWorkerScore, 
  getCredentialById,
  updateCredential,
  getAuditLogs, 
  logAuditEvent,
  getPlatformSettings,
  updatePlatformSettings,
  persistDatabase 
} from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Enforce Server-Side Admin Authorization across all admin routes
router.use(authenticateToken);
router.use(requireRole('admin'));

/**
 * GET /api/admin/stats
 * Real operational KPIs calculated directly from stored records
 */
router.get('/stats', (req, res) => {
  const db = getDB();

  const totalWorkers = db.workers.length;
  const verifiedCredentials = db.credentials.filter(c => c.status === 'VERIFIED').length;
  const pendingAssessments = db.assessmentRequests.filter(r => r.status === 'Pending Review').length;
  const activeEmployers = db.users.filter(u => u.role === 'employer').length;
  const revokedCredentials = db.credentials.filter(c => c.status === 'REVOKED').length;

  const masterWorkers = db.workers.filter(w => w.level === 4).length;
  const expertWorkers = db.workers.filter(w => w.level === 3).length;
  const skilledWorkers = db.workers.filter(w => w.level === 2).length;
  const basicWorkers = db.workers.filter(w => w.level === 1).length;

  const avgSkillScore = Math.round(
    db.workers.reduce((sum, w) => sum + (w.skillScore || 60), 0) / (totalWorkers || 1)
  );

  // Skill Score Distribution
  const scoreDistribution = [
    { range: '90-100 (Master)', count: masterWorkers, fill: '#10B981' },
    { range: '80-89 (Expert)', count: expertWorkers, fill: '#0EA5E9' },
    { range: '65-79 (Skilled)', count: skilledWorkers, fill: '#6366F1' },
    { range: '0-64 (Basic)', count: basicWorkers, fill: '#94A3B8' }
  ];

  // Trade category distribution
  const categoryStats = db.categories.slice(0, 8).map(c => ({
    name: c.name,
    count: db.workers.filter(w => 
      (w.category && w.category.toLowerCase() === c.name.toLowerCase()) ||
      (w.specialty && w.specialty.toLowerCase().includes(c.name.toLowerCase()))
    ).length
  }));

  res.json({
    kpis: {
      totalWorkers,
      verifiedCredentials,
      pendingAssessments,
      activeEmployers,
      revokedCredentials,
      avgSkillScore,
      totalAuditLogs: db.auditLogs.length
    },
    categoryStats,
    scoreDistribution,
    settings: getPlatformSettings()
  });
});

/**
 * GET /api/admin/verifications
 * Assessment requests queue for administrative evaluation
 */
router.get('/verifications', (req, res) => {
  const db = getDB();
  res.json(db.assessmentRequests);
});

/**
 * PUT /api/admin/credentials/:id/revoke
 * Formally revokes a credential with mandatory justification
 */
router.put('/credentials/:id/revoke', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A mandatory revocation justification must be recorded.' });
  }

  const credential = getCredentialById(id);
  if (!credential) {
    return res.status(404).json({ error: 'Credential record not found.' });
  }

  const updated = updateCredential(id, {
    status: 'REVOKED',
    tierLevel: 0,
    badge: 'CREDENTIAL REVOKED',
    revocationReason: reason.trim(),
    revokedAt: new Date().toISOString()
  });

  // Also reflect in worker profile
  const worker = getWorkerById(credential.workerId) || getWorkerById(credential.passportId);
  if (worker) {
    worker.level = 0;
    worker.badge = 'CREDENTIAL REVOKED';
    worker.verifications.certificationVerified = false;
    worker.verifications.practicalTestPassed = false;
    persistDatabase();
  }

  logAuditEvent(
    req.user,
    'CREDENTIAL_REVOKED',
    'credentials',
    credential.credentialId || id,
    `Revoked credential for ${credential.workerName}. Reason: ${reason}`
  );

  res.json({
    message: 'Credential successfully revoked.',
    credential: updated
  });
});

/**
 * GET /api/admin/audit-logs
 * Retrieves immutable system audit history
 */
router.get('/audit-logs', (req, res) => {
  const { limit = 50 } = req.query;
  const logs = getAuditLogs(Number(limit));
  res.json({
    total: logs.length,
    logs
  });
});

/**
 * GET /api/admin/settings
 * Retrieves configurable platform settings
 */
router.get('/settings', (req, res) => {
  res.json(getPlatformSettings());
});

/**
 * PUT /api/admin/settings
 * Updates configurable pricing and validation settings
 */
router.put('/settings', (req, res) => {
  const { assessmentFee, employerMonthlySubscription } = req.body;
  const updates = {};
  if (assessmentFee !== undefined) updates.assessmentFee = Number(assessmentFee);
  if (employerMonthlySubscription !== undefined) updates.employerMonthlySubscription = Number(employerMonthlySubscription);

  const updated = updatePlatformSettings(updates);

  logAuditEvent(
    req.user,
    'SETTINGS_UPDATED',
    'platformSettings',
    'global',
    `Updated pricing: Assessment Fee = ₹${updated.assessmentFee}, Employer Subscription = ₹${updated.employerMonthlySubscription}`
  );

  res.json({
    message: 'Platform settings updated successfully.',
    settings: updated
  });
});

export default router;
