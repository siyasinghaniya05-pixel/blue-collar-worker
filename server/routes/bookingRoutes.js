import express from 'express';
import { getDB, getWorkerById, recalculateWorkerScore, persistDatabase } from '../config/db.js';

const router = express.Router();

// Get list of bookings
router.get('/', (req, res) => {
  const { customerId, workerId } = req.query;
  const db = getDB();

  let list = db.bookings;
  if (customerId) {
    list = list.filter(b => b.customerId === customerId);
  }
  if (workerId) {
    list = list.filter(b => b.workerId === workerId);
  }

  // Sort latest first
  list.sort((a, b) => (b.scheduledDate || '').localeCompare(a.scheduledDate || ''));

  res.json(list);
});

// Get single booking by ID
router.get('/:id', (req, res) => {
  const db = getDB();
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking);
});

// Create a new booking
router.post('/', (req, res) => {
  const {
    customerId = 'usr-customer-1',
    customerName = 'Priya Malhotra',
    customerPhone = '+91 98201 45892',
    workerId,
    serviceTitle,
    category,
    scheduledDate,
    scheduledTimeSlot,
    address,
    notes = '',
    paymentMethod = 'Razorpay'
  } = req.body;

  const db = getDB();
  const worker = getWorkerById(workerId);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  // Calculate pricing
  const baseServiceFee = worker.pricing.basePrice;
  const skillTierPremium = worker.level >= 4 ? 200 : worker.level === 3 ? 100 : 0;
  const tax = Math.round((baseServiceFee + skillTierPremium) * 0.05); // 5% GST
  const totalAmount = baseServiceFee + skillTierPremium + tax;

  const bookingId = `bk-${Date.now()}`;
  const bookingNumber = `SS-BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newBooking = {
    id: bookingId,
    bookingNumber,
    customerId,
    customerName,
    customerPhone,
    workerId: worker.id,
    workerName: worker.name,
    workerSpecialty: worker.specialty,
    workerTier: worker.tierName,
    workerBadge: worker.badge,
    workerAvatar: worker.avatar,
    serviceTitle: serviceTitle || `${worker.specialty} Service Visit`,
    category: category || worker.category,
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
    scheduledTimeSlot: scheduledTimeSlot || '10:00 AM - 12:00 PM',
    address: address || '102, Green Glen Layout, Bellandur, Bengaluru',
    status: 'Confirmed',
    trackingSteps: [
      { step: 'Confirmed', time: nowTime, completed: true, note: 'Service request confirmed and payment pre-authorized' },
      { step: 'Worker Assigned', time: nowTime, completed: true, note: `${worker.name} (${worker.tierName} Tier) assigned to booking` },
      { step: 'On The Way', time: null, completed: false, note: 'Worker dispatched with calibrated equipment' },
      { step: 'Job Started', time: null, completed: false, note: 'On-site arrival & safety diagnosis' },
      { step: 'Job Completed', time: null, completed: false, note: 'Customer verification & rating' }
    ],
    pricing: {
      serviceFee: baseServiceFee,
      skillTierPremium,
      tax,
      totalAmount
    },
    paymentStatus: 'Pre-Authorized (Razorpay)',
    paymentId: `pay_SS${Math.floor(10000000 + Math.random() * 90000000)}`,
    notes,
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  persistDatabase();

  res.status(201).json({
    message: 'Booking confirmed successfully!',
    booking: newBooking
  });
});

// Update tracking status
// Progression: Confirmed -> Worker Assigned -> On The Way -> Job Started -> Job Completed
router.put('/:id/status', (req, res) => {
  const { status, note } = req.body;
  const db = getDB();
  const booking = db.bookings.find(b => b.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const validStatuses = ['Confirmed', 'Worker Assigned', 'On The Way', 'Job Started', 'Job Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid tracking status' });
  }

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  booking.status = status;

  // Mark all steps up to this status as completed
  const targetIndex = validStatuses.indexOf(status);
  booking.trackingSteps = booking.trackingSteps.map((step, idx) => {
    if (idx <= targetIndex) {
      return {
        ...step,
        completed: true,
        time: step.time || nowTime,
        note: idx === targetIndex && note ? note : step.note
      };
    }
    return step;
  });

  if (status === 'Job Completed') {
    booking.paymentStatus = 'Paid (Razorpay)';
  }

  persistDatabase();

  res.json({
    message: `Booking status updated to ${status}`,
    booking
  });
});

// Customer confirms job completion -> generates Verified Job Record
router.post('/:id/verify-completion', (req, res) => {
  const db = getDB();
  const booking = db.bookings.find(b => b.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const worker = getWorkerById(booking.workerId);

  booking.status = 'Job Completed';
  booking.isVerifiedJob = true;
  booking.verifiedJobCertificate = `VJC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  booking.verifiedAt = new Date().toISOString();

  // Mark all tracking steps completed
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  booking.trackingSteps.forEach(step => {
    step.completed = true;
    if (!step.time) step.time = nowTime;
  });

  // Update worker reputation & metrics
  if (worker) {
    worker.jobsCompleted += 1;
    // Calculate high success rate with each verified job
    const newSuccessRate = Math.min(99, Math.round(((worker.stats.jobSuccessRate * 10) + 100) / 11));
    worker.stats.jobSuccessRate = newSuccessRate;

    // Recalculate transparent score
    recalculateWorkerScore(worker.id);
  }

  persistDatabase();

  res.json({
    message: 'Job completion verified! Verified Job Record issued.',
    verifiedJobCertificate: booking.verifiedJobCertificate,
    booking,
    worker: worker ? {
      name: worker.name,
      jobsCompleted: worker.jobsCompleted,
      skillScore: worker.skillScore,
      level: worker.level
    } : null
  });
});

export default router;
