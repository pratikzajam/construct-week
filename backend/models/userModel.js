import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['jobSeeker', 'recruiter'],
      default: 'jobSeeker',
    },
    company: {
      type: String,
      required: function() {
        return this.role === 'recruiter';
      },
    },
    position: {
      type: String,
      required: function() {
        return this.role === 'recruiter';
      },
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;