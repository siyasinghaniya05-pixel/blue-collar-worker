# KaushalID — India's Verified Digital Skill Passport Registry

> **Tagline:** *Prove Your Skills. Build Your Identity. Earn Better.*

KaushalID is a production-ready, audited digital Skill Passport and skill-verification platform designed specifically for India's blue-collar and gig workforce (electricians, plumbers, carpenters, AC technicians, welders, painters, and other skilled craftsmen).

---

## 🌟 Executive Summary & Problem Solved

### The Problem
Traditional aggregator platforms (UrbanCompany, Justdial) measure workers via customer star ratings. Star ratings reflect punctuality or customer mood, not actual technical ability, electrical code adherence, or tool safety. Blue-collar workers have no portable proof of their real capabilities, keeping them trapped in low-paying gig loops. Homeowners and contractors face high trial-and-error risks hiring workers without knowing if they possess verified competence.

### The Solution: KaushalID
1. **Practical Skill Assessment**: Domain-specific rubric evaluations (mapped to NSQF benchmarks) scored by authorized assessors.
2. **Digital Skill Passport**: A tamper-proof digital credential recording verified skill competency scores, government-aligned trade levels, and accredited certifications.
3. **Cryptographic QR Verification**: Zero-app mobile camera scanning verifying credential existence, authorization, expiration, and revocation status instantly with strict privacy protection (no scraped phone numbers or Aadhaar leaks).
4. **Employer Talent Discovery**: Searchable registry for contractors to filter verified talent, inspect rubric scores, and manage talent pipelines.
5. **National Administration Console**: Server-authorized queue for approving/rejecting assessment evidence, issuing credentials, managing revocations with mandatory reasons, and maintaining immutable audit logs.
6. **Commercial Readiness**: Built-in configurable monetization (Worker assessment fee: ₹499; Employer monthly subscription: ₹999) with clearly labeled development Sandbox checkouts.

---

## 🏗️ Architecture At A Glance

- **Frontend**: React 18 SPA, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6.
- **Backend**: Node.js & Express.js REST API with modular routing architecture.
- **Security**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, bcryptjs password hashing (10 salt rounds), server-side role validation (`requireRole`), and sanitized public projection guards.
- **Database Engine**: Persistent JSON-backed NoSQL document store with automated schema migration, transactional writes, and atomic rollback safety.
- **Testing**: Built-in Node.js native test runner (`node --test tests/*.test.js`) with 100% pass rate across 11 integration test suites.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/siyasinghaniya05-pixel/blue-collar-worker.git
cd blue-collar-worker

# Install Root, Server, and Client dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Run Locally (Concurrent Backend & Frontend)
```bash
# Starts Express API on :5000 and Vite Dev Server on :3000
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Instant Demo Personas (One-Click Navbar Switcher)

| Persona | Role | Email | Password | Primary Experience |
| :--- | :--- | :--- | :--- | :--- |
| **Rajesh Patil** | Worker | `rajesh.patil@kaushalid.in` | `demo123` | Master Electrician (KID-IN-MH-10248), 95% Skill Score, NSQF Level 5, QR Passport |
| **Vikram Mehta** | Employer | `vikram.mehta@buildcon.in` | `demo123` | MEP Project Director, BuildCon Infrastructure, ₹999/mo Pro Active Subscription |
| **Admin Directorate** | Admin | `admin@kaushalid.in` | `demo123` | National Verification Officer, Assessment Review Queue, Credential Revocation |

---

## 🧪 Automated Integration Tests

Run the backend test suite:
```bash
npm test
# or: cd server && npm test
```

**Actual Results (11/11 Passing)**:
- ✔ 1. Health check returns KaushalID Platform API metadata
- ✔ 2. Unauthenticated request to `/api/admin/stats` returns 401 Unauthorized
- ✔ 3. Invalid password login returns 401 Unauthorized
- ✔ 4. Worker Demo Login returns JWT and worker profile
- ✔ 5. Worker Token accessing Admin endpoint returns 403 Forbidden
- ✔ 6. Admin Demo Login and Accessing `/api/admin/stats` returns 200 with real KPIs
- ✔ 7. QR Verification of Valid Credential (`KID-IN-MH-10248`) returns status `VERIFIED`
- ✔ 8. QR Verification of Revoked Credential (`KID-REVOKED-001`) returns status `REVOKED` with mandatory reason
- ✔ 9. QR Verification of Non-existent Credential (`KID-NONEXISTENT`) returns 404 `NOT_FOUND`
- ✔ 10. Worker submits Assessment Request and Admin reviews/approves it
- ✔ 11. Employer bookmarks and unbookmarks candidate worker

---

## 📂 Repository Documentation Suite

For comprehensive deep dives into each system tier, refer to the audited documentation files:
- 📐 [ARCHITECTURE.md](file:///c:/Users/HH/Desktop/Blue%20collar%20worker/ARCHITECTURE.md) — System architecture, sequence flows, state machines, and data pipelines.
- 🗄️ [DATABASE_SCHEMA.md](file:///c:/Users/HH/Desktop/Blue%20collar%20worker/DATABASE_SCHEMA.md) — Schemas, indexes, relationships, and migration rules.
- 🛡️ [SECURITY.md](file:///c:/Users/HH/Desktop/Blue%20collar%20worker/SECURITY.md) — Threat models, authentication, role enforcement, and privacy protection.
- 🧪 [TESTING.md](file:///c:/Users/HH/Desktop/Blue%20collar%20worker/TESTING.md) — Test suites, assertions, fixtures, and CI automation.
- 🚀 [DEPLOYMENT.md](file:///c:/Users/HH/Desktop/Blue%20collar%20worker/DEPLOYMENT.md) — Production build, environment variables, reverse proxy, and Docker guide.
- 🎓 [INTERVIEW_GUIDE.md](file:///c:/Users/HH/Desktop/Blue%20collar%20worker/INTERVIEW_GUIDE.md) — Technical mentor handbook for software engineering interviews.
