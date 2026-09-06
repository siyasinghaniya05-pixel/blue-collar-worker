const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  description: {
    type: String
  },
  icon: {
    type: String
  },
  basePrice: {
    type: Number
  },
  estimatedDuration: {
    type: String
  },
  subcategories: [{
    name: { type: String },
    price: { type: Number }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  bookingCount: {
    type: Number,
    default: 0
  }
});

ServiceSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Service', ServiceSchema);
