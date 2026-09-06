const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceSubcategory: {
    type: String
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the service needed']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please provide a scheduled date']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Please provide a scheduled time']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'worker_assigned', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  price: {
    estimated: { type: Number },
    final: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String
  },
  workerNotes: {
    type: String
  },
  completionPhotos: [String],
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
