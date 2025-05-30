import mongoose from 'mongoose';

const answerSchema = mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
  },
});

const assessmentResultSchema = mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Assessment',
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Application',
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    answers: [answerSchema],
    totalScore: {
      type: Number,
      default: 0,
    },
    percentageScore: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

export default AssessmentResult;