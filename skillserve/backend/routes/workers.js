const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect, roleCheck } = require('../middleware/auth');

router.get('/featured', async (req, res, next) => {
  try {
    const workers = await Worker.find({ isFeatured: true, 'availability.isAvailable': true })
      .populate('user', 'name avatar location phone')
      .sort({ 'skillScore.overall': -1 })
      .limit(10);

    res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    next(error);
  }
});

router.get('/top-skilled', async (req, res, next) => {
  try {
    const { category, limit = 10 } = req.query;
    const query = { 'availability.isAvailable': true };
    if (category) query.serviceCategory = category;

    const workers = await Worker.find(query)
      .populate('user', 'name avatar location')
      .sort({ 'skillScore.overall': -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard/stats', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const totalBookings = await Booking.countDocuments({ worker: worker._id });
    const completedBookings = await Booking.countDocuments({ worker: worker._id, status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ worker: worker._id, status: { $in: ['pending', 'confirmed', 'worker_assigned'] } });
    const inProgressBookings = await Booking.countDocuments({ worker: worker._id, status: { $in: ['on_the_way', 'in_progress'] } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({
      worker: worker._id,
      scheduledDate: { $gte: today },
      status: { $nin: ['cancelled'] }
    });

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyEarnings = await Booking.aggregate([
      { $match: { worker: worker._id, status: 'completed', completedAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$price.final' } } }
    ]);

    const totalEarnings = await Booking.aggregate([
      { $match: { worker: worker._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price.final' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        completedBookings,
        pendingBookings,
        inProgressBookings,
        todayBookings,
        monthlyEarnings: monthlyEarnings.length > 0 ? monthlyEarnings[0].total : 0,
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        skillScore: worker.skillScore,
        skillLevel: worker.skillLevel,
        stats: worker.stats,
        availability: worker.availability
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard/earnings', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Booking.aggregate([
      { $match: { worker: worker._id, status: 'completed', completedAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$price.final' }, count: { $sum: 1 } } }
    ]);

    const weeklyEarnings = await Booking.aggregate([
      { $match: { worker: worker._id, status: 'completed', completedAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$price.final' }, count: { $sum: 1 } } }
    ]);

    const dailyEarnings = await Booking.aggregate([
      { $match: { worker: worker._id, status: 'completed', completedAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          total: { $sum: '$price.final' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentPayments = await Booking.find({ worker: worker._id, status: 'completed' })
      .populate('customer', 'name')
      .sort({ completedAt: -1 })
      .limit(10)
      .select('price completedAt service');

    res.json({
      success: true,
      earnings: {
        monthly: monthlyEarnings.length > 0 ? monthlyEarnings[0] : { total: 0, count: 0 },
        weekly: weeklyEarnings.length > 0 ? weeklyEarnings[0] : { total: 0, count: 0 },
        daily: dailyEarnings,
        recentPayments
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/skill-progress', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const improvements = [];
    const score = worker.skillScore;

    if (score.practicalTest < 80) {
      improvements.push({
        area: 'Practical Test',
        current: score.practicalTest,
        target: 80,
        suggestion: 'Take more skill assessments to improve your practical test score'
      });
    }
    if (score.verifiedExperience < 75) {
      improvements.push({
        area: 'Verified Experience',
        current: score.verifiedExperience,
        target: 75,
        suggestion: 'Complete more jobs and get them verified to boost your experience score'
      });
    }
    if (score.jobSuccessRate < 90) {
      improvements.push({
        area: 'Job Success Rate',
        current: score.jobSuccessRate,
        target: 90,
        suggestion: 'Focus on completing jobs successfully to improve your success rate'
      });
    }
    if (score.customerFeedback < 80) {
      improvements.push({
        area: 'Customer Feedback',
        current: score.customerFeedback,
        target: 80,
        suggestion: 'Improve customer communication and service quality for better reviews'
      });
    }
    if (score.certification < 70) {
      improvements.push({
        area: 'Certifications',
        current: score.certification,
        target: 70,
        suggestion: 'Add more verified certifications to boost your certification score'
      });
    }
    if (score.reliability < 85) {
      improvements.push({
        area: 'Reliability',
        current: score.reliability,
        target: 85,
        suggestion: 'Maintain consistent punctuality and follow-through to improve reliability'
      });
    }

    const nextLevel = worker.skillLevel === 'basic' ? 'skilled' :
      worker.skillLevel === 'skilled' ? 'expert' :
        worker.skillLevel === 'expert' ? 'master' : null;

    const levelThresholds = { basic: 0, skilled: 55, expert: 75, master: 88 };

    res.json({
      success: true,
      progress: {
        currentLevel: worker.skillLevel,
        nextLevel,
        currentScore: score.overall,
        scoreToNextLevel: nextLevel ? levelThresholds[nextLevel] - score.overall : 0,
        improvements,
        breakdown: score
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const {
      serviceCategory, skillLevel, minScore, maxPrice,
      location, minExperience, sortBy = 'skillScore.overall',
      page = 1, limit = 20
    } = req.query;

    const query = { 'availability.isAvailable': true };

    if (serviceCategory) query.serviceCategory = serviceCategory;
    if (skillLevel) query.skillLevel = skillLevel;
    if (minScore) query['skillScore.overall'] = { $gte: parseInt(minScore) };
    if (maxPrice) query['pricing.min'] = { $lte: parseInt(maxPrice) };
    if (minExperience) query.experience = { $gte: parseInt(minExperience) };

    let sortOptions = {};
    if (sortBy === 'skillScore.overall') sortOptions = { 'skillScore.overall': -1 };
    else if (sortBy === 'experience') sortOptions = { experience: -1 };
    else if (sortBy === 'price-low') sortOptions = { 'pricing.min': 1 };
    else if (sortBy === 'price-high') sortOptions = { 'pricing.min': -1 };
    else if (sortBy === 'reviews') sortOptions = { 'stats.totalReviews': -1 };
    else if (sortBy === 'jobs') sortOptions = { 'stats.jobsCompleted': -1 };
    else sortOptions = { 'skillScore.overall': -1, isFeatured: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Worker.countDocuments(query);
    const workers = await Worker.find(query)
      .populate('user', 'name avatar location phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    let filteredWorkers = workers;
    if (location) {
      filteredWorkers = workers.filter(w =>
        w.user && w.user.location && w.user.location.city &&
        w.user.location.city.toLowerCase().includes(location.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: filteredWorkers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      workers: filteredWorkers
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('user', 'name avatar location phone email');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    await Worker.findByIdAndUpdate(req.params.id, { $inc: { 'stats.profileViews': 1 } });

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const { serviceCategory, serviceSubcategories, bio, experience, certifications, workPortfolio } = req.body;

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const updateFields = {};
    if (serviceCategory) updateFields.serviceCategory = serviceCategory;
    if (serviceSubcategories) updateFields.serviceSubcategories = serviceSubcategories;
    if (bio !== undefined) updateFields.bio = bio;
    if (experience !== undefined) updateFields.experience = experience;
    if (certifications) updateFields.certifications = certifications;
    if (workPortfolio) updateFields.workPortfolio = workPortfolio;

    const updatedWorker = await Worker.findByIdAndUpdate(worker._id, updateFields, { new: true, runValidators: true })
      .populate('user', 'name avatar location phone email');

    res.json({ success: true, worker: updatedWorker });
  } catch (error) {
    next(error);
  }
});

router.put('/availability', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const { isAvailable, workingHours, workingDays, maxDailyJobs } = req.body;

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    if (isAvailable !== undefined) worker.availability.isAvailable = isAvailable;
    if (workingHours) worker.availability.workingHours = workingHours;
    if (workingDays) worker.availability.workingDays = workingDays;
    if (maxDailyJobs) worker.availability.maxDailyJobs = maxDailyJobs;

    await worker.save();

    res.json({ success: true, availability: worker.availability });
  } catch (error) {
    next(error);
  }
});

router.put('/pricing', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const { min, max, currency } = req.body;

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    if (min !== undefined) worker.pricing.min = min;
    if (max !== undefined) worker.pricing.max = max;
    if (currency) worker.pricing.currency = currency;

    await worker.save();

    res.json({ success: true, pricing: worker.pricing });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
