import express from 'express';
import { getDB, getWorkerById, recalculateWorkerScore, persistDatabase } from '../config/db.js';

const router = express.Router();

// Get reviews for a worker
router.get('/worker/:workerId', (req, res) => {
  const db = getDB();
  const list = db.reviews.filter(r => r.workerId === req.params.workerId);
  res.json(list);
});

// Submit a multi-dimensional verified review
router.post('/', (req, res) => {
  const {
    bookingId,
    workerId,
    customerName = 'Verified Customer',
    customerCity = 'Mumbai',
    dimensions = {
      technicalQuality: 5,
      professionalism: 5,
      punctuality: 5,
      valueForMoney: 5,
      communication: 5
    },
    comment = ''
  } = req.body;

  const db = getDB();

  // Verify booking
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Valid completed booking required to submit a verified review.' });
  }

  if (booking.status !== 'Job Completed') {
    return res.status(400).json({ error: 'Reviews can only be submitted after the service is marked completed.' });
  }

  // Check if review already exists for this booking
  const existing = db.reviews.find(r => r.bookingId === bookingId);
  if (existing) {
    return res.status(400).json({ error: 'A review has already been submitted for this verified booking.' });
  }

  // Calculate multidimensional Customer Performance Score
  const values = Object.values(dimensions).map(Number);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const overallRating = Math.round(avg * 10) / 10;

  const reviewId = `rev-${Date.now()}`;
  const newReview = {
    id: reviewId,
    bookingId,
    workerId,
    customerName,
    customerCity,
    date: new Date().toISOString().split('T')[0],
    verifiedJob: true,
    overallRating,
    dimensions: {
      technicalQuality: Number(dimensions.technicalQuality) || 5,
      professionalism: Number(dimensions.professionalism) || 5,
      punctuality: Number(dimensions.punctuality) || 5,
      valueForMoney: Number(dimensions.valueForMoney) || 5,
      communication: Number(dimensions.communication) || 5
    },
    comment
  };

  db.reviews.unshift(newReview);
  booking.reviewSubmitted = true;

  // Update worker stats
  const worker = getWorkerById(workerId);
  if (worker) {
    const workerReviews = db.reviews.filter(r => r.workerId === worker.id);
    const totalScore = workerReviews.reduce((sum, r) => sum + r.overallRating, 0);
    worker.rating = Math.round((totalScore / workerReviews.length) * 10) / 10;
    worker.reviewCount = workerReviews.length;

    // If punctuality was 4 or 5, reinforce onTimeRate
    if (dimensions.punctuality >= 4) {
      worker.stats.onTimeRate = Math.min(99, worker.stats.onTimeRate + 1);
    }

    recalculateWorkerScore(worker.id);
  }

  persistDatabase();

  res.status(201).json({
    message: 'Verified Customer Review published! Skill Score updated.',
    review: newReview,
    updatedRating: worker ? worker.rating : overallRating,
    updatedSkillScore: worker ? worker.skillScore : null
  });
});

export default router;
