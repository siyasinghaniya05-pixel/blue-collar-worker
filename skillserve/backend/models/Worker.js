const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  serviceCategory: {
    type: String,
    required: [true, 'Please provide a service category'],
    enum: [
      'electrician', 'plumber', 'carpenter', 'acTechnician', 'painter',
      'beautician', 'applianceRepair', 'cleaning', 'mechanic', 'tutor',
      'graphicDesigner', 'webDeveloper', 'photographer', 'other'
    ]
  },
  serviceSubcategories: [String],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  experience: {
    type: Number,
    default: 0,
    min: [0, 'Experience cannot be negative']
  },
  skillLevel: {
    type: String,
    enum: ['basic', 'skilled', 'expert', 'master'],
    default: 'basic'
  },
  skillScore: {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    practicalTest: { type: Number, default: 0, min: 0, max: 100 },
    verifiedExperience: { type: Number, default: 0, min: 0, max: 100 },
    jobSuccessRate: { type: Number, default: 0, min: 0, max: 100 },
    customerFeedback: { type: Number, default: 0, min: 0, max: 100 },
    certification: { type: Number, default: 0, min: 0, max: 100 },
    reliability: { type: Number, default: 0, min: 0, max: 100 }
  },
  pricing: {
    min: { type: Number, default: 299 },
    max: { type: Number, default: 999 },
    currency: { type: String, default: 'INR' }
  },
  workPortfolio: [{
    title: { type: String },
    description: { type: String },
    images: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    date: { type: Date },
    expiryDate: { type: Date },
    verified: { type: Boolean, default: false },
    certificateUrl: { type: String }
  }],
  verification: {
    identity: { type: Boolean, default: false },
    practicalSkill: { type: Boolean, default: false },
    experience: { type: Boolean, default: false },
    certification: { type: Boolean, default: false },
    background: { type: Boolean, default: false },
    overallVerified: { type: Boolean, default: false }
  },
  stats: {
    jobsCompleted: { type: Number, default: 0 },
    successRate: { type: Number, default: 100 },
    onTimeRate: { type: Number, default: 100 },
    customerSatisfaction: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 }
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    maxDailyJobs: { type: Number, default: 5 }
  },
  skillPassport: {
    passportId: { type: String },
    qrCode: { type: String },
    issuedDate: { type: Date },
    expiryDate: { type: Date }
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

WorkerSchema.methods.calculateSkillScore = function () {
  const weights = {
    practicalTest: 0.25,
    verifiedExperience: 0.20,
    jobSuccessRate: 0.20,
    customerFeedback: 0.15,
    certification: 0.10,
    reliability: 0.10
  };

  this.skillScore.overall = Math.round(
    (this.skillScore.practicalTest * weights.practicalTest) +
    (this.skillScore.verifiedExperience * weights.verifiedExperience) +
    (this.skillScore.jobSuccessRate * weights.jobSuccessRate) +
    (this.skillScore.customerFeedback * weights.customerFeedback) +
    (this.skillScore.certification * weights.certification) +
    (this.skillScore.reliability * weights.reliability)
  );

  if (this.skillScore.overall >= 88) {
    this.skillLevel = 'master';
  } else if (this.skillScore.overall >= 75) {
    this.skillLevel = 'expert';
  } else if (this.skillScore.overall >= 55) {
    this.skillLevel = 'skilled';
  } else {
    this.skillLevel = 'basic';
  }

  return this.skillScore.overall;
};

module.exports = mongoose.model('Worker', WorkerSchema);
