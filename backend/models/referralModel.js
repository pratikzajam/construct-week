import mongoose from 'mongoose';

const referralSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job',
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    candidate: {
      name: {
        type: String,
        required: [true, 'Please add candidate name'],
      },
      email: {
        type: String,
        required: [true, 'Please add candidate email'],
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email',
        ],
      },
      phone: {
        type: String,
        default: '',
      },
      resumeUrl: {
        type: String,
        default: '',
      },
    },
    relationship: {
      type: String,
      required: [true, 'Please specify your relationship with the candidate'],
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Invited', 'Applied', 'Hired', 'Rejected'],
      default: 'Pending',
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    reward: {
      eligible: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        default: 0,
      },
      paid: {
        type: Boolean,
        default: false,
      },
      paidDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;