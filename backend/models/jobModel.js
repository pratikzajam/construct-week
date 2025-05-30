import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    requirements: {
      type: [String],
      required: [true, 'Please add job requirements'],
    },
    location: {
      type: String,
      required: [true, 'Please add a job location'],
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      required: [true, 'Please add a job type'],
    },
    salary: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    skills: {
      type: [String],
      required: [true, 'Please add required skills'],
    },
    experience: {
      min: {
        type: Number,
        required: [true, 'Please add minimum experience'],
      },
      max: {
        type: Number,
        default: 0,
      },
    },
    deadline: {
      type: Date,
      required: [true, 'Please add an application deadline'],
    },
    status: {
      type: String,
      enum: ['Open', 'Closed', 'Draft'],
      default: 'Open',
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for job search
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

const Job = mongoose.model('Job', jobSchema);

export default Job;