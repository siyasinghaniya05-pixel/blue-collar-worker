# SkillServe — Skill-Verified Service Marketplace

> **"5 Stars Tell You What Customers Think. Skill Score Shows What They Can Actually Do."**

SkillServe is a modern, full-stack service marketplace that solves inconsistent service quality and underpaid skilled professionals on traditional platforms (such as UrbanClap and Justdial) through an audited **Skill Verification & 4-Tier Worker System**.

---

## Key Features

1. **Transparent Skill Score (0–100)**:
   - Practical Benchmark Test: **40%**
   - Verified Experience: **20%**
   - Verified Job Success Rate: **15%**
   - Customer Performance Score: **10%**
   - Industry Certifications: **10%**
   - Reliability & Punctuality: **5%**

2. **4 Worker Skill Tiers**:
   - 🟢 **Level 1 — Basic**: Beginner • Basic assessment passed • Entry pricing (₹299+)
   - 🔵 **Level 2 — Skilled**: Practical test passed • Verified experience • Medium pricing (₹499+)
   - 🟣 **Level 3 — Expert**: Advanced assessment • High satisfaction • Premium pricing (₹799+)
   - 🟡 **Level 4 — Master**: Top diagnostic score • Certified • Highest pricing (₹1,199+)

3. **Digital Skill Passport & QR Verification**:
   - Portable digital credential sheet displaying verified skill breakdowns, accredited certificates, and an on-site scannable QR code.

4. **Interactive Practical Benchmarks**:
   - Workers take domain-specific diagnostic tests (wiring fault diagnosis, Inverter AC cooling issues, pressure testing) with instant auto-grading and automatic tier elevation.

5. **AI Problem Diagnosis Matcher**:
   - Matches customers based on root-cause problems (e.g. "AC not cooling", "Switchboard sparking") with top 3 tiered professionals and "Why Recommended" justification badges.

6. **5-Stage Live Booking Tracker & Multi-Dimensional Reviews**:
   - Confirmed → Worker Assigned → On The Way → Job Started → Job Completed
   - Customer completes verification to issue immutable **Verified Job Records**.
   - 5-dimension rating: Technical Quality, Professionalism, Punctuality, Value for Money, Communication.

7. **National Verification Directorate (Admin Hub)**:
   - Executive KPIs, Recharts analytics, verification request queues, anti-fraud and suspicious review detection.

---

## Quick Start Guide

### 1. Backend Setup
```bash
cd server
npm install
npm start
# Runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Runs at http://localhost:3000
```

### 3. Demo Personas (1-Click Switcher in Navbar)
- **Customer**: Priya Malhotra (`customer@skillserve.com`) — Bandra West, Mumbai
- **Master Worker**: Rahul Sharma (`worker@skillserve.com`) — Master Electrician, Mumbai (Skill Score: 94)
- **Admin**: Vikram Adani (`admin@skillserve.com`) — National Verification Directorate
