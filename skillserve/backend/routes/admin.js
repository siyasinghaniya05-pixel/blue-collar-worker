const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Service = require('../models/Service');
const { protect, roleCheck } = require('../middleware/auth');

router.get('/dashboard', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const disputedBookings = await Booking.countDocuments({ status: 'disputed' });

    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price.final' } } }
    ]);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$price.final' } } }
    ]);

    const monthlyBookings = await Booking.countDocuments({ createdAt: { $gte: thisMonth } });

    const workersByLevel = await Worker.aggregate([
      { $group: { _id: '$skillLevel', count: { $sum: 1 } } }
    ]);

    const workersByCategory = await Worker.aggregate([
      { $group: { _id: '$serviceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email' } })
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const avgRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$ratings.overall' } } }
    ]);

    res.json({
      success: true,
      dashboard: {
        users: { total: totalUsers, workers: totalWorkers, customers: totalCustomers },
        bookings: { total: totalBookings, completed: completedBookings, pending: pendingBookings, disputed: disputedBookings, monthly: monthlyBookings },
        revenue: { total: totalRevenue.length > 0 ? totalRevenue[0].total : 0, monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0 },
        workers: { byLevel: workersByLevel, byCategory: workersByCategory },
        avgRating: avgRating.length > 0 ? Math.round(avgRating[0].avg * 20) / 20 : 0,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/workers', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, skillLevel, serviceCategory, search } = req.query;
    const query = {};

    if (skillLevel) query.skillLevel = skillLevel;
    if (serviceCategory) query.serviceCategory = serviceCategory;

    let workers = await Worker.find(query)
      .populate('user', 'name email phone location isActive createdAt')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Worker.countDocuments(query);

    if (search) {
      workers = workers.filter(w =>
        w.user && (
          w.user.name.toLowerCase().includes(search.toLowerCase()) ||
          w.user.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    res.json({ success: true, count: workers.length, total, workers });
  } catch (error) {
    next(error);
  }
});

router.put('/workers/:id/level', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { skillLevel } = req.body;
    const validLevels = ['basic', 'skilled', 'expert', 'master'];

    if (!skillLevel || !validLevels.includes(skillLevel)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid skill level' });
    }

    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    worker.skillLevel = skillLevel;
    await worker.save();

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
});

router.put('/workers/:id/verify', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { verification } = req.body;

    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    if (verification) {
      if (verification.identity !== undefined) worker.verification.identity = verification.identity;
      if (verification.practicalSkill !== undefined) worker.verification.practicalSkill = verification.practicalSkill;
      if (verification.experience !== undefined) worker.verification.experience = verification.experience;
      if (verification.certification !== undefined) worker.verification.certification = verification.certification;
      if (verification.background !== undefined) worker.verification.background = verification.background;
    }

    const v = worker.verification;
    worker.verification.overallVerified = v.identity && v.practicalSkill && v.experience && v.certification && v.background;

    if (worker.verification.identity) {
      worker.skillScore.verifiedExperience = Math.min(100, worker.skillScore.verifiedExperience + 15);
    }
    if (worker.verification.practicalSkill) {
      worker.skillScore.practicalTest = Math.min(100, worker.skillScore.practicalTest + 20);
    }
    if (worker.verification.certification) {
      worker.skillScore.certification = Math.min(100, worker.skillScore.certification + 20);
    }

    worker.calculateSkillScore();
    await worker.save();

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
});

router.get('/customers', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };

    let users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    if (search) {
      users = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const customersWithStats = await Promise.all(users.map(async (user) => {
      const bookingCount = await Booking.countDocuments({ customer: user._id });
      const totalSpent = await Booking.aggregate([
        { $match: { customer: user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price.final' } } }
      ]);
      return {
        ...user.toObject(),
        bookingCount,
        totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
      };
    }));

    res.json({ success: true, count: customersWithStats.length, total, customers: customersWithStats });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, from, to } = req.query;
    const query = {};

    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customer', 'name email')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email' } })
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, count: bookings.length, total, bookings });
  } catch (error) {
    next(error);
  }
});

router.get('/reviews', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, flagged } = req.query;
    const query = {};

    if (flagged === 'true') query.isFlagged = true;
    else if (flagged === 'false') query.isFlagged = false;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('customer', 'name email')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email' } })
      .populate('booking', 'service')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, count: reviews.length, total, reviews });
  } catch (error) {
    next(error);
  }
});

router.put('/reviews/:id/flag', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { isFlagged } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isFlagged = isFlagged !== undefined ? isFlagged : !review.isFlagged;
    await review.save();

    res.json({ success: true, message: `Review ${review.isFlagged ? 'flagged' : 'unflagged'}`, review });
  } catch (error) {
    next(error);
  }
});

router.get('/disputes', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = { status: 'disputed' };
    const total = await Booking.countDocuments(query);
    const disputes = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phone' } })
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, count: disputes.length, total, disputes });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', protect, roleCheck('admin'), async (req, res, next) => {
  try {
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bookingsByMonth = await Booking.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$price.final', 0] } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topWorkers = await Worker.find()
      .populate('user', 'name')
      .sort({ 'stats.jobsCompleted': -1 })
      .limit(10)
      .select('user serviceCategory skillLevel stats skillScore');

    const topCategories = await Booking.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      { $unwind: '$serviceInfo' },
      { $group: { _id: '$serviceInfo.category', count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$price.final', 0] } } } },
      { $sort: { count: -1 } }
    ]);

    const cityStats = await User.aggregate([
      { $match: { role: 'worker' } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$ratings.overall',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        bookingsByStatus,
        bookingsByMonth,
        topWorkers,
        topCategories,
        cityStats,
        ratingDistribution
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
