const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, role, location, serviceCategory, bio, experience } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      location: location || {}
    });

    if (role === 'worker') {
      const workerProfile = {
        user: user._id,
        serviceCategory: serviceCategory || 'other',
        bio: bio || '',
        experience: experience || 0
      };
      await Worker.create(workerProfile);
    }

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.generateAuthToken();

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ user: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
        workerProfile: workerProfile ? { id: workerProfile._id, skillLevel: workerProfile.skillLevel, skillScore: workerProfile.skillScore } : null
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        workerProfile
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/updateprofile', protect, async (req, res, next) => {
  try {
    const { name, phone, location, avatar } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (location) updateFields.location = location;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true, runValidators: true });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/changepassword', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateAuthToken();

    res.json({ success: true, message: 'Password updated successfully', token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
