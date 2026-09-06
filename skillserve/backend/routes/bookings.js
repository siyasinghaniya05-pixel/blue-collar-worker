const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const { protect, roleCheck } = require('../middleware/auth');

router.post('/', protect, roleCheck('customer'), async (req, res, next) => {
  try {
    const { workerId, serviceId, serviceSubcategory, description, address, scheduledDate, scheduledTime, estimatedPrice } = req.body;

    if (!workerId || !serviceId || !description || !address || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    if (!worker.availability.isAvailable) {
      return res.status(400).json({ success: false, message: 'Worker is currently not available' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      worker: workerId,
      service: serviceId,
      serviceSubcategory,
      description,
      address,
      scheduledDate,
      scheduledTime,
      price: { estimated: estimatedPrice || service.basePrice, currency: 'INR' },
      status: 'pending'
    });

    await Service.findByIdAndUpdate(serviceId, { $inc: { bookingCount: 1 } });

    await Notification.create({
      user: worker.user,
      title: 'New Booking Request',
      message: `You have a new booking request from ${req.user.name} for ${service.name}`,
      type: 'booking',
      referenceId: booking._id,
      referenceModel: 'Booking'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('worker')
      .populate('service', 'name slug category');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ user: req.user._id });
      if (worker) {
        query.worker = worker._id;
      }
    }

    if (status) query.status = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phone avatar' } })
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

router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone avatar location')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phone avatar location' } })
      .populate('service', 'name slug category icon description');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.customer._id.toString() === req.user._id.toString();
    const isWorker = booking.worker && booking.worker.user && booking.worker.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isWorker && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, workerNotes, finalPrice, paymentMethod } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name' } })
      .populate('service', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const validStatusTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['worker_assigned', 'cancelled'],
      worker_assigned: ['on_the_way', 'cancelled'],
      on_the_way: ['in_progress'],
      in_progress: ['completed', 'disputed'],
      completed: [],
      cancelled: [],
      disputed: ['completed', 'cancelled']
    };

    if (!validStatusTransitions[booking.status] || !validStatusTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${booking.status}' to '${status}'`
      });
    }

    const isWorker = req.user.role === 'worker' && booking.worker && booking.worker.user._id.toString() === req.user._id.toString();
    const isCustomer = req.user.role === 'customer' && booking.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (status === 'cancelled' && !isCustomer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only customer can cancel a booking' });
    }

    if (['confirmed', 'worker_assigned', 'on_the_way', 'in_progress'].includes(status) && !isWorker && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only worker can update to this status' });
    }

    booking.status = status;
    if (workerNotes) booking.workerNotes = workerNotes;
    if (finalPrice) booking.price.final = finalPrice;
    if (paymentMethod) booking.paymentMethod = paymentMethod;

    if (status === 'completed') {
      booking.completedAt = new Date();
      if (!booking.price.final) booking.price.final = booking.price.estimated;
      booking.paymentStatus = 'paid';

      await Worker.findByIdAndUpdate(booking.worker._id, {
        $inc: { 'stats.jobsCompleted': 1 }
      });
    }

    if (status === 'cancelled') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    let notificationUser, notificationTitle, notificationMessage;
    if (status === 'confirmed' || status === 'worker_assigned' || status === 'on_the_way' || status === 'in_progress') {
      notificationUser = booking.customer._id;
      notificationTitle = `Booking ${status.replace('_', ' ')}`;
      notificationMessage = `Your booking for ${booking.service.name} has been ${status.replace('_', ' ')}`;
    } else {
      notificationUser = booking.worker.user._id;
      notificationTitle = `Booking ${status}`;
      notificationMessage = `Booking for ${booking.service.name} has been ${status}`;
    }

    await Notification.create({
      user: notificationUser,
      title: notificationTitle,
      message: notificationMessage,
      type: 'booking',
      referenceId: booking._id,
      referenceModel: 'Booking'
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phone' } })
      .populate('service', 'name slug category');

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/verify', protect, roleCheck('customer'), async (req, res, next) => {
  try {
    const { verified, feedback } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only verify completed bookings' });
    }

    if (verified) {
      booking.paymentStatus = 'paid';
      await booking.save();

      const worker = await Worker.findById(booking.worker);
      if (worker) {
        const allBookings = await Booking.countDocuments({ worker: worker._id, status: 'completed' });
        const totalBookings = await Booking.countDocuments({ worker: worker._id });
        worker.stats.successRate = totalBookings > 0 ? Math.round((allBookings / totalBookings) * 100) : 100;
        worker.calculateSkillScore();
        await worker.save();
      }

      await Notification.create({
        user: worker.user,
        title: 'Payment Confirmed',
        message: `Customer has confirmed completion and payment for booking`,
        type: 'payment',
        referenceId: booking._id,
        referenceModel: 'Booking'
      });
    }

    res.json({ success: true, message: 'Booking verification updated', booking });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
