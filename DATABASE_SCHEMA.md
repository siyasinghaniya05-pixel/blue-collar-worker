# KaushalID — Database Schema & Data Modeling Specification

This document details the database schema, entity attributes, referential constraints, indexing strategies, and migration protocols implemented in **KaushalID**.

---

## 1. Data Store Architecture

KaushalID implements a normalized document model stored in a persistent transactional data file (`server/data/kaushalid_db.json`) managed by `server/config/db.js`.

The data engine features:
- In-memory high-throughput read cache.
- Synchronous write flushes with atomic backup.
- Schema auto-migration on server boot: missing collections (`credentials`, `assessmentRequests`, `employerProfiles`, `auditLogs`, `platformSettings`) are automatically provisioned and seeded from default schemas.

---

## 2. Entity Schemas

### 2.1 `users` Collection
Stores authentication principals, encrypted password digests, and system authorization roles.

```json
{
  "id": "String (UUID / 'user-worker-1')",
  "email": "String (Unique, Normalized lowercase)",
  "password": "String (Bcrypt hash with 10 salt rounds)",
  "fullName": "String",
  "role": "Enum: 'worker' | 'employer' | 'admin'",
  "avatar": "String (URL, Optional)",
  "phone": "String (E.164, Private)",
  "createdAt": "ISO 8601 Timestamp",
  "updatedAt": "ISO 8601 Timestamp"
}
```

- **Primary Key**: `id`
- **Unique Indexes**: `email`
- **Security Constraints**: Password hash is never emitted in API responses (`delete user.password`). Public registration endpoint `/api/auth/register` rejects any payload with `role === 'admin'`.

---

### 2.2 `workers` Collection
Contains the extended trade identity, skill scores, work history, and certification records for blue-collar professionals.

```json
{
  "id": "String (UUID / 'worker-1')",
  "userId": "String (Foreign Key -> users.id)",
  "kaushalId": "String (Unique, format: 'KID-IN-MH-10248')",
  "displayName": "String",
  "trade": "String (e.g. 'Senior Electrical Technician')",
  "city": "String (e.g. 'Mumbai, Maharashtra')",
  "experienceYears": "Number (e.g. 6)",
  "verifiedStatus": "Enum: 'verified' | 'under_review' | 'not_submitted' | 'rejected' | 'revoked'",
  "verificationLevel": "Enum: 'Level 1 - Foundation' | 'Level 2 - Skilled' | 'Level 3 - Master Technician' | 'Master'",
  "verificationDate": "String (Formatted date, e.g. '14 Jan 2026')",
  "completionRate": "Number (0-100)",
  "skills": [
    {
      "name": "String (e.g. 'Three-Phase Wiring & Distribution')",
      "score": "Number (0-100)",
      "verified": "Boolean",
      "level": "String (e.g. 'Master')"
    }
  ],
  "certifications": [
    {
      "id": "String (e.g. 'CERT-NSDC-2024-098')",
      "name": "String (e.g. 'National Skills Qualification Framework')",
      "issuer": "String (e.g. 'Skill India / NSDC')",
      "issueDate": "String",
      "verified": "Boolean"
    }
  ],
  "workHistory": [
    {
      "project": "String",
      "client": "String",
      "period": "String",
      "verified": "Boolean"
    }
  ]
}
```

- **Primary Key**: `id`
- **Unique Indexes**: `kaushalId`, `userId`
- **Referential Integrity**: Cascades with `users.id`.

---

### 2.3 `credentials` Collection
Represents official digital credentials and Skill Passports issued to workers, verifiable via QR codes.

```json
{
  "credentialId": "String (Unique, format: 'KID-IN-MH-10248')",
  "workerId": "String (Foreign Key -> workers.id)",
  "workerName": "String",
  "trade": "String",
  "status": "Enum: 'VERIFIED' | 'UNDER_REVIEW' | 'EXPIRED' | 'REVOKED'",
  "verificationLevel": "String",
  "issuingAuthority": "String (e.g. 'KaushalID National Directorate')",
  "issuedAt": "ISO 8601 Timestamp",
  "validUntil": "ISO 8601 Timestamp",
  "revokedAt": "ISO 8601 Timestamp (Null if active)",
  "revocationReason": "String (Mandatory if status is 'REVOKED')"
}
```

- **Primary Key**: `credentialId`
- **Foreign Key**: `workerId` -> `workers.id`
- **State Validation Rules**:
  - If `status === 'REVOKED'`, `revocationReason` must be a non-empty string.
  - If `status === 'EXPIRED'`, `validUntil < new Date()`.

---

### 2.4 `assessmentRequests` Collection
Tracks practical skill assessment bookings, submitted test evidence, assessor evaluations, and review outcomes.

```json
{
  "id": "String (UUID / 'REQ-1001')",
  "workerId": "String (Foreign Key -> workers.id)",
  "workerName": "String",
  "trade": "String",
  "skillCategory": "String",
  "evidence": "String (Diagnostic responses, photo/tool URLs, project notes)",
  "feePaid": "Number (Standard: 499 INR)",
  "status": "Enum: 'PENDING' | 'APPROVED' | 'REJECTED'",
  "assessorDecision": "String (e.g. 'APPROVED')",
  "assessorScore": "Number (0-100)",
  "assessorNotes": "String",
  "reviewedBy": "String (Admin User Email)",
  "reviewerReason": "String",
  "reviewedAt": "ISO 8601 Timestamp",
  "createdAt": "ISO 8601 Timestamp"
}
```

---

### 2.5 `employerProfiles` Collection
Contains organizational details, talent search settings, saved candidate bookmarks, and active subscription status.

```json
{
  "id": "String (UUID / 'emp-1')",
  "userId": "String (Foreign Key -> users.id)",
  "companyName": "String (e.g. 'BuildCon Infrastructure Ltd')",
  "industry": "String (e.g. 'Commercial Construction & MEP')",
  "savedWorkers": [
    "String (Array of KaushalIDs, e.g. ['KID-IN-MH-10248'])"
  ],
  "subscriptionStatus": "Enum: 'active' | 'inactive' | 'expired'",
  "subscriptionPlan": "String (e.g. 'pro_monthly')",
  "validUntil": "ISO 8601 Timestamp"
}
```

---

### 2.6 `auditLogs` Collection
Immutable, append-only security log recording administrative actions, credential revocations, and verification reviews.

```json
{
  "id": "String (UUID / 'audit-1')",
  "actor": "String (User email or 'system')",
  "action": "Enum: 'ASSESSMENT_REVIEW' | 'CREDENTIAL_REVOKED' | 'CREDENTIAL_MINTED' | 'SETTINGS_UPDATED' | 'WORKER_REGISTERED'",
  "targetEntity": "String (e.g. 'credential', 'assessment_request')",
  "targetId": "String (e.g. 'KID-IN-MH-10248')",
  "details": "Object (Snapshot of modified state and rationale)",
  "timestamp": "ISO 8601 Timestamp"
}
```

---

### 2.7 `platformSettings` Collection
Stores configurable pricing and system parameters without requiring code redeployments.

```json
{
  "assessmentFee": 499,
  "employerMonthlySubscription": 999,
  "currency": "INR",
  "assessmentCenterMode": "assessor_review",
  "lastUpdated": "ISO 8601 Timestamp"
}
```

---

## 3. Data Integrity & Migration Guarantees

1. **Auto-Backfill Protocol**: On every server boot, `server/config/db.js` evaluates existing JSON data against schema definitions. If any required collection is missing or malformed, it merges the defaults without overwriting active user or worker records.
2. **Referential Check Before Credential Minting**: When an administrator approves an assessment request (`POST /api/assessment-requests/:id/review`), the database engine verifies that the `workerId` corresponds to an existing worker record before generating the `credentialId`.
3. **Atomic Writes**: Writes to disk use synchronous file writes with try-catch blocks to prevent half-written corruptions during unexpected shutdowns.
