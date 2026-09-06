import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, getDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Database Layer
initDatabase();

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/match', matchingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const db = getDB();
  res.json({
    status: 'OK',
    service: 'SkillServe API',
    version: '1.0.0',
    workersCount: db.workers.length,
    bookingsCount: db.bookings.length,
    categoriesCount: db.categories.length,
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.send('SkillServe Skill-Verified Service Marketplace API is running. Access /api/health for system status.');
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` SkillServe Backend running at http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
