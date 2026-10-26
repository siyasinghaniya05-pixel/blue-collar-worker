import express from 'express';
import { getEmployerProfile, updateEmployerProfile, getWorkerById, logAuditEvent, getPlatformSettings } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/employer/profile
 * Retrieves employer profile, active subscription, and saved candidates
 */
router.get('/profile', authenticateToken, requireRole('employer'), (req, res) => {
  const profile = getEmployerProfile(req.user.id);
  res.json(profile);
});

/**
 * POST /api/employer/save-worker
 * Toggles bookmarking for a candidate worker
 */
router.post('/save-worker', authenticateToken, requireRole('employer'), (req, res) => {
  const { workerId } = req.body;
  if (!workerId) {
    return res.status(400).json({ error: 'Worker ID is required.' });
  }

  const profile = getEmployerProfile(req.user.id);
  if (!Array.isArray(profile.savedWorkers)) {
    profile.savedWorkers = [];
  }

  const cleanId = workerId.trim();
  const exists = profile.savedWorkers.includes(cleanId);

  let updatedList;
  if (exists) {
    updatedList = profile.savedWorkers.filter(id => id !== cleanId);
  } else {
    updatedList = [...profile.savedWorkers, cleanId];
  }

  updateEmployerProfile(req.user.id, { savedWorkers: updatedList });

  res.json({
    message: exists ? 'Worker removed from saved candidates.' : 'Worker saved to candidates list.',
    savedWorkers: updatedList,
    isSaved: !exists
  });
});

/**
 * POST /api/employer/subscribe
 * Sandbox subscription checkout for employer accounts (proposed ₹999/month)
 */
router.post('/subscribe', authenticateToken, requireRole('employer'), (req, res) => {
  const { plan = 'Monthly Enterprise', paymentMethod = 'Sandbox NetBanking' } = req.body;
  const settings = getPlatformSettings();
  const price = settings.employerMonthlySubscription || 999;

  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const updated = updateEmployerProfile(req.user.id, {
    subscription: {
      status: 'Active',
      plan,
      price,
      paymentMethod,
      validUntil,
      verificationCredits: 50,
      activatedAt: new Date().toISOString()
    }
  });

  logAuditEvent(
    req.user,
    'SUBSCRIPTION_PURCHASED',
    'employerProfiles',
    req.user.id,
    `Employer renewed ${plan} subscription for ₹${price} (Sandbox Mode)`
  );

  res.json({
    message: 'Subscription successfully activated (Sandbox Mode).',
    subscription: updated.subscription
  });
});

export default router;
