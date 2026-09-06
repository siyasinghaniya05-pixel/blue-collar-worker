const mongoose = require('mongoose');

const SkillAssessmentSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  serviceCategory: {
    type: String,
    required: true
  },
  assessmentTitle: {
    type: String,
    required: true
  },
  questions: [{
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ['practical', 'theoretical', 'scenario'],
      required: true
    },
    options: [String],
    correctAnswer: { type: String },
    points: { type: Number, default: 10 },
    rubric: { type: String }
  }],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  level: {
    type: String,
    enum: ['basic', 'skilled', 'expert', 'master'],
    default: 'basic'
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  assessorNotes: {
    type: String
  }
});

module.exports = mongoose.model('SkillAssessment', SkillAssessmentSchema);
