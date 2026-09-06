import express from 'express';
import jwt from 'jsonwebtoken';
import { getDB, persistDatabase } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skillserve-jwt-super-secret-key-2025';

// Quick Demo Login switch
router.post('/demo-login', (req, res) => {
  const { role = 'customer' } = req.body;
  const db = getDB();

  let user;
  if (role === 'worker') {
    user = db.users.find(u => u.email === 'worker@skillserve.com');
  } else if (role === 'admin') {
    user = db.users.find(u => u.email === 'admin@skillserve.com');
  } else {
    user = db.users.find(u => u.email === 'customer@skillserve.com');
  }

  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // If worker, also attach worker profile ID
  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = db.workers.find(w => w.userId === user.id || w.id === 'w-1');
  }

  res.json({
    token,
    user,
    workerProfile
  });
});

// Standard Login
router.post('/login', (req, res) => {
  const { email } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Use demo login or register.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = db.workers.find(w => w.userId === user.id);
  }

  res.json({
    token,
    user,
    workerProfile
  });
});

// Register
router.post('/register', (req, res) => {
  const { name, email, role = 'customer', city = 'Mumbai', specialty = 'Electricians' } = req.body;
  const db = getDB();

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUserId = `usr-${Date.now()}`;
  const newUser = {
    id: newUserId,
    name,
    email,
    role,
    city,
    phone: '+91 90000 00000',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.users.push(newUser);

  let workerProfile = null;
  if (role === 'worker') {
    const newWorkerId = `w-${Date.now()}`;
    workerProfile = {
      id: newWorkerId,
      userId: newUserId,
      name,
      specialty: `Basic ${specialty}`,
      category: specialty,
      level: 1,
      tierName: 'Basic',
      badge: '🟢 BASIC',
      skillScore: 55,
      rating: 4.0,
      reviewCount: 0,
      experienceYears: 1,
      jobsCompleted: 0,
      stats: {
        jobSuccessRate: 90,
        onTimeRate: 90,
        repeatCustomerRate: 0,
        avgResolutionTime: '60 mins'
      },
      city,
      areasServed: [city],
      avatar: newUser.avatar,
      bio: `Newly registered verified ${specialty} professional on SkillServe.`,
      pricing: {
        basePrice: 299,
        rangeText: '₹299 – ₹499 / Service',
        inspectionFee: 149,
        unit: 'service'
      },
      skillBreakdown: [
        { name: 'Core Foundations', score: 65 },
        { name: 'Safety Procedures', score: 60 },
        { name: 'Tool Operation', score: 62 }
      ],
      verifications: {
        identityVerified: true,
        identityDocType: 'Govt ID Uploaded',
        practicalTestPassed: false,
        practicalTestScore: 0,
        experienceVerified: false,
        certificationVerified: false,
        certCount: 0,
        backgroundCheck: true,
        backgroundStatus: 'Clear'
      },
      certifications: [],
      portfolio: [],
      experienceTimeline: [
        { year: '2025', role: 'Joined SkillServe', org: 'SkillServe Platform', desc: 'Registered and verified identity.' }
      ],
      passportQrData: `skillserve://verify/worker/${newWorkerId}`
    };
    db.workers.push(workerProfile);
  }

  persistDatabase();

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: newUser,
    workerProfile
  });
});

// Current user profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = db.workers.find(w => w.userId === user.id || w.id === 'w-1');
    }

    res.json({ user, workerProfile });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
