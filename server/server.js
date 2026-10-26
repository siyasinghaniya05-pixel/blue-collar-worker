import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, getDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import assessmentWorkflowRoutes from './routes/assessmentWorkflowRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Database Layer
initDatabase();

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/assessment-requests', assessmentWorkflowRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/match', matchingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const db = getDB();
  res.json({
    status: 'OK',
    service: 'KaushalID Platform API',
    tagline: 'Prove Your Skills. Build Your Identity. Earn Better.',
    version: '1.0.0',
    workersCount: db.workers?.length || 0,
    credentialsCount: db.credentials?.length || 0,
    assessmentRequestsCount: db.assessmentRequests?.length || 0,
    auditLogsCount: db.auditLogs?.length || 0,
    timestamp: new Date().toISOString()
  });
});

// Production Static Serving (if frontend dist exists)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('KaushalID API is running. Access /api/health for system status.');
  });
}

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[KaushalID Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'SERVER_ERROR'
    }
  });
});

// Start listening (only when not in test runner)
const isTestMode = process.env.NODE_ENV === 'test' || process.argv.some(arg => String(arg).includes('test'));
if (!isTestMode) {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` KaushalID Backend running at http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;

