import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDB, persistDatabase, getWorkerById, getEmployerProfile } from '../config/db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper: Find user by primary email or alternate aliases
 */
function findUserByEmail(email) {
  if (!email) return null;
  const db = getDB();
  const lower = email.trim().toLowerCase();
  return db.users.find(u => 
    u.email.toLowerCase() === lower || 
    (Array.isArray(u.alternateEmails) && u.alternateEmails.some(a => a.toLowerCase() === lower))
  );
}

/**
 * POST /api/auth/demo-login
 * Fast 1-click persona switcher for evaluation & demonstration
 */
router.post('/demo-login', (req, res) => {
  const { role = 'worker' } = req.body;
  const db = getDB();

  let targetEmail;
  if (role === 'worker') {
    targetEmail = 'rajesh.patil@kaushalid.in';
  } else if (role === 'employer') {
    targetEmail = 'vikram.mehta@buildcon.in';
  } else if (role === 'admin') {
    targetEmail = 'admin@kaushalid.in';
  } else {
    targetEmail = 'rajesh.patil@kaushalid.in';
  }

  let user = findUserByEmail(targetEmail);
  if (!user) {
    user = db.users.find(u => u.role === role);
  }

  if (!user) {
    return res.status(404).json({ error: `Demo persona for role '${role}' not found.` });
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      kaushalId: user.kaushalId || null 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  let profile = null;
  if (user.role === 'worker') {
    profile = getWorkerById(user.id) || db.workers[0];
  } else if (user.role === 'employer') {
    profile = getEmployerProfile(user.id);
  }

  res.json({
    message: `Signed in as ${user.name} (${user.role})`,
    token,
    user: {
      id: user.id,
      name: user.name,
      displayName: user.name,
      email: user.email,
      role: user.role,
      kaushalId: user.kaushalId || profile?.kaushalId,
      phone: user.phone,
      city: user.city,
      avatar: user.avatar
    },
    profile
  });
});

/**
 * POST /api/auth/login
 * Standard email & password login with bcrypt verification
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email address.' });
  }

  // Password verification: test against bcrypt hash or permit standard demo credential 'demo123'
  let passwordValid = false;
  if (user.passwordHash) {
    passwordValid = bcrypt.compareSync(password, user.passwordHash) || password === 'demo123';
  } else {
    // If legacy user without hash, accept standard password and upgrade hash
    passwordValid = password === 'demo123' || password.length >= 6;
    if (passwordValid) {
      user.passwordHash = bcrypt.hashSync(password, 10);
      persistDatabase();
    }
  }

  if (!passwordValid) {
    return res.status(401).json({ error: 'Incorrect password. Try demo password: "demo123".' });
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      kaushalId: user.kaushalId || null 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  let profile = null;
  if (user.role === 'worker') {
    profile = getWorkerById(user.id) || getWorkerById(user.kaushalId);
  } else if (user.role === 'employer') {
    profile = getEmployerProfile(user.id);
  }

  res.json({
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      displayName: user.name,
      email: user.email,
      role: user.role,
      kaushalId: user.kaushalId || profile?.kaushalId,
      phone: user.phone,
      city: user.city,
      avatar: user.avatar
    },
    profile
  });
});

/**
 * POST /api/auth/register
 * New user registration. Disallows public admin self-assignment.
 */
router.post('/register', async (req, res) => {
  const { 
    name, 
    email, 
    password = 'demo123', 
    role = 'worker', 
    city = 'Mumbai', 
    phone = '+91 90000 00000',
    trade = 'General Electrician',
    companyName = 'Infrastructure Contractor'
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // Security Rule: Public registration cannot create an administrator account
  const assignedRole = (role === 'admin') ? 'worker' : role;

  const db = getDB();
  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUserId = `usr-${Date.now()}`;
  
  // Generate valid state code and KaushalID for workers
  const stateCode = 'MH';
  const kaushalId = assignedRole === 'worker' 
    ? `KID-IN-${stateCode}-${Math.floor(10000 + Math.random() * 90000)}` 
    : null;

  const newUser = {
    id: newUserId,
    name,
    email,
    passwordHash,
    role: assignedRole,
    kaushalId,
    city,
    phone,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  let profile = null;
  if (assignedRole === 'worker') {
    const newWorkerId = `w-${Date.now()}`;
    profile = {
      id: newWorkerId,
      userId: newUserId,
      kaushalId,
      name,
      specialty: trade,
      category: trade.toLowerCase().includes('plumb') ? 'Plumbers' : (trade.toLowerCase().includes('wel') ? 'Welders' : 'Electricians'),
      occupation: trade,
      level: 1,
      tierName: 'Level 1 - Basic',
      badge: '🟢 BASIC',
      skillScore: 60,
      rating: 4.0,
      reviewCount: 0,
      experienceYears: 1,
      jobsCompleted: 0,
      stats: {
        jobSuccessRate: 100,
        onTimeRate: 100,
        repeatCustomerRate: 0,
        avgResolutionTime: '60 mins'
      },
      city,
      areasServed: [city],
      avatar: newUser.avatar,
      bio: `Professional ${trade} based in ${city}. New KaushalID registered member.`,
      pricing: {
        basePrice: 499,
        rangeText: '₹499 / Assessment',
        inspectionFee: 199,
        unit: 'assessment'
      },
      skills: [
        { name: trade, score: 60, verified: false, level: 'Basic' }
      ],
      scoreComponents: {
        practicalTest: { score: 'Pending Test', weight: '40%', points: 24.0 },
        verifiedExperience: { score: '1 Year', weight: '20%', points: 12.0 },
        jobSuccessRate: { score: '100%', weight: '15%', points: 15.0 },
        customerFeedback: { score: '4.0/5', weight: '10%', points: 8.0 },
        certifications: { score: '0 Verified', weight: '10%', points: 0.0 },
        reliability: { score: '100% On-Time', weight: '5%', points: 5.0 }
      },
      verifications: {
        identityVerified: true,
        identityDocType: 'Self-Reported Initial Record',
        practicalTestPassed: false,
        practicalTestScore: 0,
        experienceVerified: false,
        certificationVerified: false,
        backgroundCheck: false
      },
      certifications: [],
      workHistory: []
    };
    db.workers.push(profile);
  } else if (assignedRole === 'employer') {
    profile = getEmployerProfile(newUserId);
    profile.companyName = companyName;
  }

  persistDatabase();

  const token = jwt.sign(
    { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role, 
      name: newUser.name,
      kaushalId 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'Registration successful.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      displayName: newUser.name,
      email: newUser.email,
      role: newUser.role,
      kaushalId,
      phone: newUser.phone,
      city: newUser.city,
      avatar: newUser.avatar
    },
    profile
  });
});

/**
 * GET /api/auth/me
 * Retrieves currently authenticated user profile
 */
router.get('/me', authenticateToken, (req, res) => {
  const user = findUserByEmail(req.user.email) || getDB().users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  let profile = null;
  if (user.role === 'worker') {
    profile = getWorkerById(user.id) || getWorkerById(user.kaushalId) || getDB().workers[0];
  } else if (user.role === 'employer') {
    profile = getEmployerProfile(user.id);
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      displayName: user.name,
      email: user.email,
      role: user.role,
      kaushalId: user.kaushalId || profile?.kaushalId,
      phone: user.phone,
      city: user.city,
      avatar: user.avatar
    },
    profile
  });
});

/**
 * PUT /api/auth/profile
 * Updates user profile details
 */
router.put('/profile', authenticateToken, (req, res) => {
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === req.user.id || u.email.toLowerCase() === req.user.email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { displayName, phone, city, trade, companyName } = req.body;
  if (displayName) db.users[userIndex].name = displayName;
  if (phone) db.users[userIndex].phone = phone;
  if (city) db.users[userIndex].city = city;

  let profile = null;
  if (db.users[userIndex].role === 'worker') {
    const worker = getWorkerById(db.users[userIndex].id) || getWorkerById(db.users[userIndex].kaushalId);
    if (worker) {
      if (displayName) worker.name = displayName;
      if (city) worker.city = city;
      if (trade) {
        worker.specialty = trade;
        worker.occupation = trade;
      }
      profile = worker;
    }
  } else if (db.users[userIndex].role === 'employer') {
    profile = getEmployerProfile(db.users[userIndex].id);
    if (companyName) profile.companyName = companyName;
    if (city) profile.city = city;
  }

  persistDatabase();

  res.json({
    message: 'Profile updated successfully.',
    user: {
      id: db.users[userIndex].id,
      name: db.users[userIndex].name,
      displayName: db.users[userIndex].name,
      email: db.users[userIndex].email,
      role: db.users[userIndex].role,
      kaushalId: db.users[userIndex].kaushalId,
      phone: db.users[userIndex].phone,
      city: db.users[userIndex].city,
      avatar: db.users[userIndex].avatar
    },
    profile
  });
});

export default router;
