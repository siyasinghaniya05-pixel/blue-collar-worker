import express from 'express';
import { 
  getAssessmentRequests, 
  getAssessmentRequestById, 
  createAssessmentRequest, 
  updateAssessmentRequest,
  getWorkerById,
  updateWorker,
  createCredential,
  updateCredential,
  getCredentialById,
  logAuditEvent,
  getPlatformSettings
} from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/assessment-requests
 * Returns assessment requests:
 * Workers see their own requests; Admins see all requests.
 */
router.get('/', authenticateToken, (req, res) => {
  const { status } = req.query;
  const isPrivileged = req.user.role === 'admin';

  let list;
  if (isPrivileged) {
    list = getAssessmentRequests({ status });
  } else {
    const workerIdentifier = req.user.kaushalId || req.user.id;
    list = getAssessmentRequests({ workerId: workerIdentifier, status });
  }

  res.json({
    total: list.length,
    requests: list
  });
});

/**
 * POST /api/assessment-requests
 * Worker requests a practical benchmark assessment (proposed fee: ₹499).
 */
router.post('/', authenticateToken, requireRole('worker'), (req, res) => {
  const { trade, skillArea, evidenceDescription } = req.body;

  if (!trade || !skillArea) {
    return res.status(400).json({ error: 'Trade and skill area are required to request an assessment.' });
  }

  const worker = getWorkerById(req.user.kaushalId) || getWorkerById(req.user.id);
  const settings = getPlatformSettings();

  const newRequest = {
    id: `AR-${Date.now()}`,
    workerId: worker?.id || req.user.id,
    kaushalId: req.user.kaushalId || worker?.kaushalId || `KID-IN-MH-${Date.now().toString().slice(-5)}`,
    workerName: req.user.name,
    trade,
    skillArea,
    status: 'Pending Review',
    feePaid: settings.assessmentFee || 499,
    submittedAt: new Date().toISOString(),
    evidenceDescription: evidenceDescription || 'Practical workbench verification requested.',
    assessorNotes: null,
    score: null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null
  };

  createAssessmentRequest(newRequest);

  logAuditEvent(
    req.user,
    'ASSESSMENT_REQUESTED',
    'assessmentRequests',
    newRequest.id,
    `Assessment requested for trade: ${trade} - Skill: ${skillArea} (Fee: ₹${newRequest.feePaid})`
  );

  res.status(201).json({
    message: 'Assessment request submitted successfully and queued for assessor review.',
    request: newRequest
  });
});

/**
 * PUT /api/assessment-requests/:id/review
 * Authorized Assessor / Admin reviews and approves or rejects an assessment.
 */
router.put('/:id/review', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { status, score, assessorNotes, rejectionReason } = req.body;

  const request = getAssessmentRequestById(id);
  if (!request) {
    return res.status(404).json({ error: 'Assessment request not found.' });
  }

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: "Review status must be either 'Approved' or 'Rejected'." });
  }

  if (status === 'Rejected' && (!rejectionReason || !rejectionReason.trim())) {
    return res.status(400).json({ error: 'A mandatory rejection reason is required when declining an assessment.' });
  }

  const numScore = score !== undefined ? Number(score) : (status === 'Approved' ? 90 : 45);

  const updatedRequest = updateAssessmentRequest(id, {
    status,
    score: numScore,
    assessorNotes: assessorNotes || (status === 'Approved' ? 'Demonstrated solid technical execution and safety standard compliance.' : 'Benchmark standards not fully satisfied.'),
    rejectionReason: status === 'Rejected' ? rejectionReason : null,
    reviewedBy: req.user.id,
    reviewedAt: new Date().toISOString()
  });

  // If approved: update worker credentials & skill tier
  let issuedCredential = null;
  if (status === 'Approved') {
    const worker = getWorkerById(request.kaushalId) || getWorkerById(request.workerId);
    if (worker) {
      // Elevate skill level
      const newLevel = numScore >= 92 ? 4 : (numScore >= 80 ? 3 : 2);
      const tierName = newLevel === 4 ? 'Level 4 - Master Technician' : (newLevel === 3 ? 'Level 3 - Expert Specialist' : 'Level 2 - Certified Technician');
      const badge = newLevel === 4 ? 'MASTER VERIFIED' : (newLevel === 3 ? 'EXPERT VERIFIED' : 'SKILLED VERIFIED');

      worker.level = newLevel;
      worker.tierName = tierName;
      worker.badge = badge;
      worker.skillScore = Math.max(worker.skillScore || 70, numScore);

      // Add to verified skills
      if (!Array.isArray(worker.skills)) worker.skills = [];
      const existingSkillIdx = worker.skills.findIndex(s => s.name.toLowerCase() === request.skillArea.toLowerCase());
      if (existingSkillIdx >= 0) {
        worker.skills[existingSkillIdx].verified = true;
        worker.skills[existingSkillIdx].score = numScore;
      } else {
        worker.skills.push({
          name: request.skillArea,
          score: numScore,
          verified: true,
          level: newLevel === 4 ? 'Master' : 'Skilled'
        });
      }
      updateWorker(worker.id, worker);
    }

    // Mint or update official credential
    const existingCred = getCredentialById(request.kaushalId);
    const credPayload = {
      id: `CRED-${request.kaushalId}`,
      credentialId: request.kaushalId,
      passportId: request.kaushalId,
      workerId: request.workerId,
      workerName: request.workerName,
      trade: request.trade,
      status: 'VERIFIED',
      tierLevel: numScore >= 92 ? 4 : 3,
      tierName: numScore >= 92 ? 'Level 4 - Master Technician' : 'Level 3 - Expert Specialist',
      badge: numScore >= 92 ? 'MASTER VERIFIED' : 'EXPERT VERIFIED',
      skillScore: numScore,
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issuingAuthority: 'National Skill Verification Directorate',
      authorizedAssessor: req.user.name || 'Authorized Assessor',
      verifiedCompetencies: [
        { name: request.skillArea, score: numScore, standard: 'NSQF Level 5 Aligned', verified: true }
      ],
      digitalSignatureHash: `sha256-verified-${Date.now()}`
    };

    if (existingCred) {
      issuedCredential = updateCredential(request.kaushalId, credPayload);
    } else {
      issuedCredential = createCredential(credPayload);
    }

    logAuditEvent(
      req.user,
      'ASSESSMENT_APPROVED',
      'assessmentRequests',
      id,
      `Approved assessment for ${request.workerName} with score ${numScore}. Minted/Updated credential ${request.kaushalId}`
    );
  } else {
    logAuditEvent(
      req.user,
      'ASSESSMENT_REJECTED',
      'assessmentRequests',
      id,
      `Rejected assessment for ${request.workerName}. Reason: ${rejectionReason}`
    );
  }

  res.json({
    message: `Assessment successfully ${status.toLowerCase()}.`,
    request: updatedRequest,
    credential: issuedCredential
  });
});

export default router;
