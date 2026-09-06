const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const { protect, roleCheck } = require('../middleware/auth');

router.post('/', protect, roleCheck('customer'), async (req, res, next) => {
  try {
    const { bookingId, ratings, comment } = req.body;

    if (!bookingId || !ratings) {
      return res.status(400).json({ success: false, message: 'Please provide booking ID and ratings' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this booking' });
    }

    const overall = Math.round(
      (ratings.technicalQuality + ratings.professionalism + ratings.punctuality +
        ratings.valueForMoney + ratings.communication) / 5
    );

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      worker: booking.worker,
      ratings: { ...ratings, overall },
      comment
    });

    const worker = await Worker.findById(booking.worker);
    if (worker) {
      const allReviews = await Review.find({ worker: worker._id });
      const totalReviews = allReviews.length;
      const avgSatisfaction = allReviews.reduce((sum, r) => sum + r.ratings.overall, 0) / totalReviews;

      worker.stats.totalReviews = totalReviews;
      worker.stats.customerSatisfaction = Math.round(avgSatisfaction * 20);

      const feedbackScore = Math.round(avgSatisfaction * 20);
      worker.skillScore.customerFeedback = feedbackScore;
      worker.calculateSkillScore();

      await worker.save();

      await Notification.create({
        user: worker.user,
        title: 'New Review',
        message: `You received a ${overall}-star review from ${req.user.name}`,
        type: 'review',
        referenceId: review._id,
        referenceModel: 'Review'
      });
    }

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatar')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name avatar' } });

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    next(error);
  }
});

router.get('/worker/:workerId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments({ worker: req.params.workerId, isFlagged: false });
    const reviews = await Review.find({ worker: req.params.workerId, isFlagged: false })
      .populate('customer', 'name avatar')
      .populate('booking', 'service serviceSubcategory')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const ratingSummary = await Review.aggregate([
      { $match: { worker: require('mongoose').Types.ObjectId.createFromHexString(req.params.workerId), isFlagged: false } },
      {
        $group: {
          _id: null,
          avgTechnicalQuality: { $avg: '$ratings.technicalQuality' },
          avgProfessionalism: { $avg: '$ratings.professionalism' },
          avgPunctuality: { $avg: '$ratings.punctuality' },
          avgValueForMoney: { $avg: '$ratings.valueForMoney' },
          avgCommunication: { $avg: '$ratings.communication' },
          avgOverall: { $avg: '$ratings.overall' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      summary: ratingSummary.length > 0 ? ratingSummary[0] : null,
      reviews
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/response', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ success: false, message: 'Please provide a response' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker || review.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this review' });
    }

    if (review.response) {
      return res.status(400).json({ success: false, message: 'Response already exists for this review' });
    }

    review.response = response;
    review.responseDate = new Date();
    await review.save();

    await Notification.create({
      user: review.customer,
      title: 'Worker Response to Review',
      message: `The worker has responded to your review`,
      type: 'review',
      referenceId: review._id,
      referenceModel: 'Review'
    });

    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/flag', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { isFlagged, reason } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isFlagged = isFlagged !== undefined ? isFlagged : !review.isFlagged;
    await review.save();

    if (review.isFlagged) {
      const worker = await Worker.findById(review.worker);
      if (worker) {
        const activeReviews = await Review.countDocuments({ worker: worker._id, isFlagged: false });
        const allReviews = await Review.find({ worker: worker._id, isFlagged: false });
        if (activeReviews > 0) {
          const avgSatisfaction = allReviews.reduce((sum, r) => sum + r.ratings.overall, 0) / activeReviews;
          worker.stats.customerSatisfaction = Math.round(avgSatisfaction * 20);
          worker.skillScore.customerFeedback = Math.round(avgSatisfaction * 20);
          worker.calculateSkillScore();
          await worker.save();
        }
      }
    }

    res.json({ success: true, message: `Review ${review.isFlagged ? 'flagged' : 'unflagged'} successfully`, review });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
