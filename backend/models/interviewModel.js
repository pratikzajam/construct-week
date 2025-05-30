import mongoose from 'mongoose';

const interviewSchema = mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Application',
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job',
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please add a scheduled date'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please add interview duration'],
    },
    type: {
      type: String,
      enum: ['Phone', 'Video', 'In-person', 'Technical', 'HR'],
      required: [true, 'Please add interview type'],
    },
    location: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;