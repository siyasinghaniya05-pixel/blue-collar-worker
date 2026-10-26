# KaushalID — Architecture & System Design Document

This document details the architectural principles, component structure, state lifecycles, and sequence workflows that power the **KaushalID** platform.

---

## 1. High-Level System Architecture

KaushalID follows a decoupled client-server architecture designed for high availability, low latency on mobile networks, and cryptographic verification integrity:

```
                      +---------------------------------------+
                      |       Web & Mobile Clients            |
                      |  - Worker Smartphone (PWA / Responsive)|
                      |  - Employer Desktop & Tablet          |
                      |  - Public Smartphone (QR Scan Camera) |
                      |  - Admin Directorate Console          |
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / JSON REST API
                                          v
                      +-------------------+-------------------+
                      |      Express.js Gateway Server        |
                      |  - CORS & Rate Limiter Middleware     |
                      |  - Static Production SPA Serving      |
                      |  - Global Error Handling & Logging    |
                      +-------------------+-------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+-------+---------------+         +-------+---------------+         +-------+---------------+
| Public Routing Tier   |         | Auth Guard & JWT Tier |         | Protected Business Tier|
| - GET /api/verify/:id |         | - authenticateToken   |         | - /api/assessment-req |
|   (Sanitized Worker)  |         | - requireRole('admin')|         | - /api/employer/*     |
| - GET /api/health     |         | - requireRole('worker')|        | - /api/admin/*        |
| - POST /api/auth/*    |         | - requireRole('emp')  |         | - /api/workers        |
+-------+---------------+         +-------+---------------+         +-------+---------------+
        |                                 |                                 |
        +---------------------------------+---------------------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |   Data Access & Persistence Engine    |
                      |  - In-Memory Document Store Cache     |
                      |  - Atomically Flushed JSON Storage    |
                      |  - Automatic Seed Backfilling Engine  |
                      |  - Transactional Rollback Handlers    |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |   Physical Data Storage (JSON/NoSQL)  |
                      |   [server/data/kaushalid_db.json]     |
                      |   - users         - credentials       |
                      |   - workers       - assessmentRequests|
                      |   - employers     - auditLogs         |
                      |   - settings      - reviews           |
                      +---------------------------------------+
```

---

## 2. Security Boundaries & Authorization Levels

KaushalID enforces strict defense-in-depth security. Role assignments are validated server-side on every request and never inferred from client-controlled parameters.

| Boundary | Endpoints | Access Policy | Privacy / Data Masking |
| :--- | :--- | :--- | :--- |
| **Public Unauthenticated** | `GET /api/health`<br>`POST /api/auth/login`<br>`POST /api/auth/register`<br>`POST /api/auth/demo-login` | Open to all clients. Rate-limited. | Registration forbids `admin` role injection. Returns sanitized user identity. |
| **Public Credential Verification** | `GET /api/verify/:credentialId` | Open to all clients (QR camera scanners). | **Strict Privacy Masking**: Aadhaar numbers, phone numbers, and full residential addresses are stripped from the response payload. Only verified trade scores and official badges are emitted. |
| **Worker Protected** | `GET /api/auth/me`<br>`POST /api/assessment-requests`<br>`GET /api/assessment-requests/my` | Requires valid Bearer JWT. Role must match `worker` (or `admin`). | Can only view and create assessment requests for the authenticated worker's profile. |
| **Employer Protected** | `GET /api/employer/profile`<br>`POST /api/employer/save-worker`<br>`POST /api/employer/subscribe` | Requires valid Bearer JWT. Role must match `employer` (or `admin`). | Persistent candidate bookmarks and subscription billing lifecycle. |
| **Admin Superuser** | `GET /api/admin/stats`<br>`POST /api/assessment-requests/:id/review`<br>`PUT /api/admin/credentials/:id/revoke`<br>`GET /api/admin/audit-logs`<br>`PUT /api/admin/settings` | Requires valid Bearer JWT. Role must strictly match `admin`. Enforced by `requireRole('admin')`. | Access to system-wide audit logs, raw assessment evidence, credential minting, and configuration. |

---

## 3. End-to-End Sequence Diagrams

### 3.1 Worker Assessment Request & Review Workflow

```
Worker Client                Express API (Auth Guard)         Admin Reviewer               Database Engine
     |                                  |                           |                             |
     | 1. POST /api/assessment-requests |                           |                             |
     |    (skillCategory, evidence)     |                           |                             |
     | -------------------------------> |                           |                             |
     |                                  | 2. Verify JWT & worker    |                             |
     |                                  | ------------------------------------------------------> |
     |                                  | 3. Create Request (PENDING)                             |
     |                                  | ------------------------------------------------------> |
     | 4. 201 Created (reqId, fee: ₹499)|                           |                             |
     | <------------------------------- |                           |                             |
     |                                  |                           | 5. GET /api/assessment-req  |
     |                                  |                           |    (Review Queue)           |
     |                                  | <------------------------ |                             |
     |                                  | 6. Return Pending Records |                             |
     |                                  | ------------------------> |                             |
     |                                  |                           | 7. POST /:id/review         |
     |                                  |                           |    (decision: APPROVED,     |
     |                                  |                           |     score: 95, level: Master)|
     |                                  | <------------------------ |                             |
     |                                  | 8. requireRole('admin')    |                             |
     |                                  | 9. Auto-Mint Credential                                 |
     |                                  | 10. Update Worker Tier                                  |
     |                                  | 11. Write Immutable Audit Log                           |
     |                                  | ------------------------------------------------------> |
     |                                  | 12. 200 OK (Minted KID)   |                             |
     |                                  | ------------------------> |                             |
     | 13. GET /api/auth/me             |                           |                             |
     | <------------------------------- |                           |                             |
     | (Displays Minted QR Passport)    |                           |                             |
```

---

### 3.2 Public QR Verification Workflow

```
Customer / Contractor              Public Browser                  Express Server              Database Engine
       |                                  |                               |                           |
       | 1. Scans physical QR with camera |                               |                           |
       | -------------------------------> |                               |                           |
       |                                  | 2. GET /passport/KID-MH-10248 |                           |
       |                                  | ----------------------------> |                           |
       |                                  |                               | 3. GET /api/verify/KID... |
       |                                  |                               | ------------------------> |
       |                                  |                               | 4. Query credentials      |
       |                                  |                               | <------------------------ |
       |                                  |                               | 5. Status Decision:       |
       |                                  |                               |    - VERIFIED             |
       |                                  |                               |    - UNDER_REVIEW         |
       |                                  |                               |    - EXPIRED              |
       |                                  |                               |    - REVOKED (reason)     |
       |                                  |                               | 6. Apply Privacy Filter   |
       |                                  |                               |    (Strip Phone & Aadhaar)|
       |                                  | 7. 200 OK (Sanitized JSON)    |                           |
       |                                  | <---------------------------- |                           |
       | 8. Displays Official Seal &      |                               |                           |
       |    Live Status Card              |                               |                           |
       | <------------------------------- |                               |                           |
```

---

## 4. Credential Lifecycle & State Machine

Every digital credential issued by KaushalID adheres to an immutable finite state machine:

```
              [Worker Registration]
                        |
                        v
                 +--------------+
                 | NOT_SUBMITTED|
                 +-------+------+
                         |
                         | Worker submits ₹499 Assessment Request
                         v
                 +--------------+
                 | UNDER_REVIEW | <--------------------+
                 +-------+------+                      |
                         |                             |
         +---------------+---------------+             | Re-assessment
         |                               |             | requested
         | Assessor Rejection            | Assessor    |
         v                               | Approval    |
  +--------------+                       v             |
  |   REJECTED   |                +--------------+     |
  | (with reason)|                |   VERIFIED   | ----+
  +--------------+                +-------+------+
                                          |
                         +----------------+----------------+
                         |                                 |
                         | Validity period passed          | Safety violation or fraud
                         v                                 v
                  +--------------+                  +--------------+
                  |   EXPIRED    |                  |   REVOKED    |
                  +--------------+                  | (with reason)|
                                                    +--------------+
```

### State Definitions:
1. `NOT_SUBMITTED`: Worker profile exists, but no official practical assessment has been booked.
2. `UNDER_REVIEW`: Assessment request submitted with fee ₹499 and diagnostic evidence; queued for assessor review.
3. `VERIFIED`: Authorized assessor and administrator approved diagnostic criteria. Credential minted with verifiable cryptographic identifier and QR representation.
4. `REJECTED`: Assessment failed rubric criteria. Mandatory rejection rationale recorded in audit logs.
5. `EXPIRED`: Credential reached its defined validity date without a renewal assessment.
6. `REVOKED`: Platform administrator permanently invalidated the credential due to safety code violations, fraud, or trade license lapse. Public verification returns an explicit red warning and the recorded revocation rationale.

---

## 5. Privacy By Design Architecture

To protect informal and blue-collar workers from phone number scraping, identity theft, and spam marketing:
1. **Public Projection Filter**: When `GET /api/verify/:credentialId` is requested, the backend applies `sanitizePublicWorker(worker, credential)`.
2. **Hidden Fields**: `phone`, `email`, `aadhaarNumber`, `fullAddress`, `bankDetails`, and `internalId` are removed.
3. **Publicly Emitted Fields**:
   - `credentialId` (e.g. `KID-IN-MH-10248`)
   - `workerName` (e.g. `Rajesh Patil`)
   - `trade` (e.g. `Senior Electrical Technician`)
   - `city` (e.g. `Mumbai, Maharashtra`)
   - `status` (`VERIFIED` | `REVOKED` | `EXPIRED` | `UNDER_REVIEW`)
   - `verificationLevel` (e.g. `Level 3 - Master Technician`)
   - `verifiedDate` & `validUntil`
   - `issuingAuthority` (e.g. `KaushalID National Directorate`)
   - `verifiedSkills` (Score & Level array)
   - `verifiedCertifications` (Title & Issuing Body)
