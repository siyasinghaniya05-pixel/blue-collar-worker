const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { user: req.user._id };

    if (unreadOnly === 'true') query.isRead = false;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      notifications
    });
  } catch (error) {
    next(error);
  }
});

router.put('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
