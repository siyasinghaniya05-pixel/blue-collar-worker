# KaushalID — Security Policy, Threat Model & Privacy Framework

This document outlines the security architecture, threat model, cryptographic mechanisms, role authorization guards, and data privacy controls implemented across **KaushalID**.

---

## 1. Threat Model & Mitigations

| Threat Vector | Potential Impact | Implemented Mitigation in KaushalID |
| :--- | :--- | :--- |
| **Credential Tampering / Counterfeiting** | Fake technicians creating counterfeit QR codes claiming to be verified Master Electricians. | **Cryptographic Registry Lookup**: The QR code encodes a URL referencing the server-side registry (`/verify/:credentialId`). The verification endpoint verifies that the credential exists in the database, is issued by an authorized entity, has not expired, and has not been revoked. Client images or self-asserted badges are never trusted. |
| **Privilege Escalation** | An attacker registering a new account and injecting `role: "admin"` to access the review queue. | **Server-Enforced Role Guard**: `POST /api/auth/register` explicitly forbids the `'admin'` role: `if (role === 'admin') role = 'worker'`. Admin accounts can only be seeded via controlled backend configuration. Privileged routes are protected by `authenticateToken` + `requireRole('admin')`. |
| **Mass Worker Scraping & Privacy Leaks** | Data brokers scraping personal phone numbers, home addresses, or Aadhaar numbers of vulnerable blue-collar workers. | **Strict Public Privacy Masking**: The public verification endpoint (`GET /api/verify/:credentialId`) applies `sanitizePublicWorker()`. Contact phone numbers, email addresses, and full residential addresses are completely omitted from public API payloads. |
| **Payment Spoofing & Fraudulent Tier Elevation** | Malicious users forging payment confirmations to elevate their worker tier without passing practical assessments. | **Server-Side Workflow Decoupling**: Assessment request creation records a pending fee state. Skill tier elevation and credential issuance only occur when an authorized administrator or assessor approves the assessment request through `POST /api/assessment-requests/:id/review`. |
| **Unauthorized Credential Revocation** | Competitors or unauthorized users revoking a legitimate craftsman's Skill Passport. | **Protected Admin Endpoint & Mandatory Rationale**: Revocation endpoint `PUT /api/admin/credentials/:id/revoke` requires an active admin JWT. Revocations require a non-empty `reason` string and generate an immutable entry in `auditLogs`. |
| **Brute Force & Credential Stuffing** | Automated dictionary attacks against worker and employer logins. | **Bcrypt Password Digests**: Passwords are saved with 10 rounds of salt. Rate limiters and timing-safe password comparisons are implemented on authentication routes. |

---

## 2. Authentication & Token Management

1. **Password Security**:
   - Stored using `bcryptjs` with salt round factor 10.
   - Plaintext passwords are never logged, stored in memory, or included in outgoing JSON serialization.
2. **JSON Web Tokens (JWT)**:
   - Signed using `crypto.createHmac('sha256')` with `JWT_SECRET`.
   - Payload includes: `{ id, email, role, fullName }`.
   - Token expiration defaults to 7 days (`7d`).
   - Token header format: `Authorization: Bearer <TOKEN>`.
3. **Session Invalidation**:
   - Frontend removes `kaushalid_jwt_token` on logout.
   - Backend validates the token signature and verifies user existence on every protected call (`/api/auth/me`).

---

## 3. Server-Side Role Enforcement

Role authorization is implemented as layered middleware in `server/middleware/auth.js`:

```javascript
// Server-Side Role Guard Middleware
export const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    // Superuser admin bypasses worker/employer requirements
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Forbidden: Requires one of [${roles.join(', ')}] role` 
      });
    }
    
    next();
  };
};
```

### Critical Authorization Rule:
Frontend role checks (e.g. conditional UI rendering) are treated as **pure convenience** for user experience. Every state-changing action, data modification, and private data access is validated independently on the backend.

---

## 4. Privacy by Design: Public vs Private Projections

To protect worker safety and comply with data privacy principles:

```javascript
// Sanitizer applied to all public verification endpoints
export const sanitizePublicWorker = (worker, credential) => {
  return {
    credentialId: credential.credentialId,
    workerName: worker.displayName,
    trade: worker.trade,
    city: worker.city,
    experienceYears: worker.experienceYears,
    status: credential.status, // 'VERIFIED' | 'UNDER_REVIEW' | 'EXPIRED' | 'REVOKED'
    verificationLevel: credential.verificationLevel,
    issuingAuthority: credential.issuingAuthority,
    issuedAt: credential.issuedAt,
    validUntil: credential.validUntil,
    revocationReason: credential.revocationReason || null,
    verifiedSkills: (worker.skills || []).filter(s => s.verified),
    verifiedCertifications: (worker.certifications || []).filter(c => c.verified),
    verifiedWorkHistory: (worker.workHistory || []).filter(w => w.verified)
    // NOTE: phone, email, fullAddress, aadhaar, and internal IDs are NEVER included.
  };
};
```

---

## 5. Audit Logging Architecture

All security-sensitive operations trigger an append-only entry in the `auditLogs` collection:
- `ASSESSMENT_REVIEW`: Records reviewer ID, previous status, updated status, and rubric score.
- `CREDENTIAL_REVOKED`: Records admin ID, credential ID, timestamp, and mandatory revocation rationale.
- `CREDENTIAL_MINTED`: Records authorized issuance timestamp and recipient worker ID.
- `SETTINGS_UPDATED`: Records system pricing changes (e.g. assessment fee or subscription rate).

Audit records are queryable by administrators via `GET /api/admin/audit-logs` and are never editable or deletable via the API.
