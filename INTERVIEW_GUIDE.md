# KaushalID — Software Engineering Interview Preparation Guide

This guide is designed to empower you to discuss the architecture, engineering decisions, security trade-offs, and scalability considerations of **KaushalID** during high-level Full-Stack, System Design, and Behavioral software engineering interviews.

---

## 1. The 30-Second Elevator Pitch

> *"KaushalID is India's first verified digital Skill Passport registry for skilled blue-collar trades. Existing gig platforms rely on customer star ratings, which measure customer satisfaction or punctuality rather than actual technical mastery, code compliance, or safety protocols. We designed a dual-sided platform with practical rubric assessments, tamper-proof QR credentials, server-enforced role authorization, and strict privacy filtering to give informal craftsmen a portable, verifiable professional identity they can carry across jobs."*

---

## 2. Key Architecture Decisions & Technical Justifications

### Q1: "Why did you build server-side role validation instead of managing roles in client state or Firebase claims?"
**Answer:**
> *"In a credential verification platform, client state is untrusted territory. If role assignments exist only in local storage, a malicious user can edit `localStorage` or inject arbitrary JSON into client-side state. 
> 
> In KaushalID, we enforce defense-in-depth:
> 1. Role assignment during registration (`POST /api/auth/register`) explicitly rejects any attempt to register an `admin` account.
> 2. Every incoming request must provide an HMAC-SHA256 signed Bearer token.
> 3. Our `requireRole` middleware checks the decoded token payload on the server before dispatching to controllers.
> 4. Even if an attacker modifies client code to render the Admin Dashboard, any request to `/api/admin/stats` or `/api/admin/credentials/:id/revoke` fails with HTTP 403 Forbidden on the backend."*

---

### Q2: "How does the QR verification mechanism prevent fraud and tampering?"
**Answer:**
> *"There are two common anti-patterns in QR verification:
> 1. Encoding the worker's data directly inside the QR code (e.g. JSON string).
> 2. Generating a static image with a green checkmark.
> 
> Both are vulnerable: an attacker can easily forge a QR code with fabricated scores or take a screenshot of someone else's verified passport.
> 
> We solved this by using **indirection via a cryptographic registry lookup**:
> - The QR code encodes only a secure URI (`/passport/:credentialId`).
> - When scanned, the customer's phone camera hits our backend verification endpoint (`GET /api/verify/:credentialId`).
> - The server queries the database for existence, checks the issuing authority, validates expiration dates, and checks revocation status.
> - If a worker has been revoked due to a safety violation, the server returns status `REVOKED` along with the mandatory revocation reason, turning the badge red in real time."*

---

### Q3: "How did you address blue-collar worker data privacy?"
**Answer:**
> *"Informal and blue-collar workers in India are frequently targets of spam, aggressive micro-loan solicitations, and predatory data scraping.
> 
> We implemented a strict **Privacy by Design Projection**:
> - When a credential is queried through public endpoints (`/api/verify/:credentialId`), the response is passed through `sanitizePublicWorker()`.
> - This filter strips personal telephone numbers, home addresses, emails, Aadhaar identifiers, and internal database keys.
> - Only verified technical competencies, rubric scores, issuing authorities, and trade levels are rendered publicly. Employers wanting to contact a worker must authenticate and initiate contact through the platform."*

---

### Q4: "Walk me through the state machine of a Skill Passport."
**Answer:**
> *"The credential adheres to a 5-state lifecycle:
> 1. `NOT_SUBMITTED`: Worker profile is created, but no assessment has been conducted.
> 2. `UNDER_REVIEW`: The worker books a practical assessment (fee: ₹499) and submits diagnostic evidence. The request is queued for an authorized assessor.
> 3. `VERIFIED`: The assessor and administrator inspect the diagnostic evidence, score the rubric criteria, and approve the submission. A unique KaushalID (`KID-...`) is minted and published to the registry.
> 4. `REJECTED`: The evidence did not meet technical competency thresholds; a mandatory rejection explanation is provided to the worker.
> 5. `REVOKED`: The administrator invalidates an active credential due to trade malpractice or fraudulent evidence, recording an immutable audit log entry.
> 6. `EXPIRED`: The credential validity window elapses, prompting a renewal assessment."*

---

### Q5: "How did you implement the test suite and why without Jest/Mocha?"
**Answer:**
> *"For our backend integration tests, we chose Node.js's native test runner (`node:test` and `node:assert`).
> 
> The advantages were clear:
> - **Zero extra dependencies**: We didn't bloat `node_modules` with Jest or Babel.
> - **Native ES Module Support**: No transpilation steps or polyfill configuration.
> - **Speed**: The complete 11-suite integration suite executes in under 1.5 seconds directly against the live Express server and persistent database.
> - **Comprehensive Coverage**: We test 401 unauthenticated guards, 403 role guards, demo logins, valid QR lookups, revoked QR lookups with reasons, non-existent 404s, assessment approval workflows, and candidate bookmarking."*

---

## 3. System Design Blueprint (If Asked to Scale)

If asked: *"How would you scale KaushalID to 10 million workers and 500,000 employers across India?"*

1. **Database Evolution**:
   - Migrate from the single-file document store to a managed PostgreSQL or MongoDB Atlas cluster.
   - Separate write-heavy assessment submissions from read-heavy public QR lookups.
2. **Caching & Edge Delivery**:
   - Put Cloudflare or AWS CloudFront in front of `/api/verify/:credentialId` with a Redis read-through cache.
   - Cache `VERIFIED` credentials with a 5-minute TTL; invalidate immediately on administrative revocation using a Redis Pub/Sub event.
3. **Storage & Media Evidence**:
   - Offload practical assessment video evidence and trade certificate scans to AWS S3 or Cloudflare R2 with pre-signed upload URLs.
4. **Offline Mobile Experience (PWA)**:
   - Provide Service Worker caching so workers in rural areas with spotty 2G/3G connectivity can always show their cached Skill Passport and QR code on site.
5. **Payment Integration**:
   - Transition from the Sandbox mock provider to Razorpay / Cashfree using verified HMAC webhook listeners and idempotent transaction logging.
