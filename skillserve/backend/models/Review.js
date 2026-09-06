const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
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
  ratings: {
    technicalQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  response: {
    type: String,
    maxlength: [500, 'Response cannot be more than 500 characters']
  },
  responseDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ReviewSchema.index({ worker: 1, createdAt: -1 });
ReviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
