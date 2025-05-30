import mongoose from 'mongoose';

const questionSchema = mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add a question'],
  },
  type: {
    type: String,
    enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Coding'],
    required: [true, 'Please specify question type'],
  },
  options: {
    type: [String],
    default: [],
  },
  correctAnswer: {
    type: String,
    required: function() {
      return this.type !== 'Short Answer' && this.type !== 'Coding';
    },
  },
  points: {
    type: Number,
    default: 1,
  },
});

const assessmentSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    timeLimit: {
      type: Number, // in minutes
      required: [true, 'Please add a time limit'],
    },
    passingScore: {
      type: Number,
      required: [true, 'Please add a passing score'],
    },
    questions: [questionSchema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;