const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, roleCheck } = require('../middleware/auth');

router.get('/profile', protect, roleCheck('customer'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const totalBookings = await Booking.countDocuments({ customer: user._id });
    const activeBookings = await Booking.countDocuments({
      customer: user._id,
      status: { $in: ['pending', 'confirmed', 'worker_assigned', 'on_the_way', 'in_progress'] }
    });
    const completedBookings = await Booking.countDocuments({
      customer: user._id,
      status: 'completed'
    });

    const totalSpent = await Booking.aggregate([
      { $match: { customer: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price.final' } } }
    ]);

    const recentBookings = await Booking.find({ customer: user._id })
      .populate({ path: 'worker', populate: { path: 'user', select: 'name avatar' } })
      .populate('service', 'name slug category icon')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      profile: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        stats: {
          totalBookings,
          activeBookings,
          completedBookings,
          totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
        },
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings/history', protect, roleCheck('customer'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { customer: req.user._id };

    if (status) query.status = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate({ path: 'worker', populate: { path: 'user', select: 'name avatar phone' } })
      .populate('service', 'name slug category icon')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      bookings
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
