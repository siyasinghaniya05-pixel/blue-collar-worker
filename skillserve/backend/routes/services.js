const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const services = await Service.find(query).sort({ bookingCount: -1 });

    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const services = await Service.find({ category: req.params.category, isActive: true })
      .sort({ bookingCount: -1 });

    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
