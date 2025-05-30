import asyncHandler from 'express-async-handler';
import Interview from '../models/interviewModel.js';
import Application from '../models/applicationModel.js';
import User from '../models/userModel.js';
import Job from '../models/jobModel.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Schedule an interview
// @route   POST /api/interviews
// @access  Private/Recruiter
const scheduleInterview = asyncHandler(async (req, res) => {
  const {
    applicationId,
    scheduledDate,
    duration,
    type,
    location,
    meetingLink,
    notes,
  } = req.body;

  // Check if application exists
  const application = await Application.findById(applicationId);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check if the recruiter is authorized
  if (application.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to schedule interview for this application');
  }

  // Create interview
  const interview = await Interview.create({
    application: applicationId,
    job: application.job,
    applicant: application.applicant,
    recruiter: req.user._id,
    scheduledDate,
    duration,
    type,
    location,
    meetingLink,
    notes,
  });

  // Update application status
  application.status = 'Interview Scheduled';
  await application.save();

  // Get applicant email
  const applicant = await User.findById(application.applicant);
  const job = await Job.findById(application.job);

  // Send email notification to applicant
  if (applicant && applicant.email) {
    await sendEmail({
      to: applicant.email,
      subject: `Interview Scheduled for ${job.title}`,
      html: `
        <h1>Interview Scheduled</h1>
        <p>An interview has been scheduled for your application to the position of ${job.title} at ${job.company}.</p>
        <p><strong>Date:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p><strong>Type:</strong> ${type}</p>
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>Please login to your dashboard for more details.</p>
      `,
    });
  }

  res.status(201).json(interview);
});

// @desc    Get all interviews for a recruiter
// @route   GET /api/interviews/recruiter
// @access  Private/Recruiter
const getRecruiterInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ recruiter: req.user._id })
    .populate('job', 'title company')
    .populate('applicant', 'name email')
    .populate('application')
    .sort({ scheduledDate: 1 });

  res.json(interviews);
});

// @desc    Get all interviews for an applicant
// @route   GET /api/interviews/applicant
// @access  Private/JobSeeker
const getApplicantInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ applicant: req.user._id })
    .populate('job', 'title company')
    .populate('recruiter', 'name email company')
    .populate('application')
    .sort({ scheduledDate: 1 });

  res.json(interviews);
});

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate('job', 'title company location')
    .populate('applicant', 'name email')
    .populate('recruiter', 'name email company')
    .populate('application');

  if (interview) {
    // Check if user is authorized to view this interview
    if (
      interview.applicant._id.toString() !== req.user._id.toString() &&
      interview.recruiter._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this interview');
    }

    res.json(interview);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private/Recruiter
const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (interview) {
    // Check if the recruiter is authorized
    if (interview.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this interview');
    }

    interview.scheduledDate = req.body.scheduledDate || interview.scheduledDate;
    interview.duration = req.body.duration || interview.duration;
    interview.type = req.body.type || interview.type;
    interview.location = req.body.location || interview.location;
    interview.meetingLink = req.body.meetingLink || interview.meetingLink;
    interview.notes = req.body.notes || interview.notes;
    interview.status = req.body.status || interview.status;

    if (req.body.status === 'Rescheduled') {
      // Get applicant email
      const applicant = await User.findById(interview.applicant);
      const job = await Job.findById(interview.job);

      // Send email notification to applicant
      if (applicant && applicant.email) {
        await sendEmail({
          to: applicant.email,
          subject: `Interview Rescheduled for ${job.title}`,
          html: `
            <h1>Interview Rescheduled</h1>
            <p>Your interview for the position of ${job.title} at ${job.company} has been rescheduled.</p>
            <p><strong>New Date:</strong> ${new Date(interview.scheduledDate).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${interview.duration} minutes</p>
            <p><strong>Type:</strong> ${interview.type}</p>
            ${interview.location ? `<p><strong>Location:</strong> ${interview.location}</p>` : ''}
            ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ''}
            ${interview.notes ? `<p><strong>Notes:</strong> ${interview.notes}</p>` : ''}
            <p>Please login to your dashboard for more details.</p>
          `,
        });
      }
    }

    const updatedInterview = await interview.save();
    res.json(updatedInterview);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

// @desc    Complete interview with feedback
// @route   PUT /api/interviews/:id/complete
// @access  Private/Recruiter
const completeInterview = asyncHandler(async (req, res) => {
  const { feedback, rating } = req.body;

  const interview = await Interview.findById(req.params.id);

  if (interview) {
    // Check if the recruiter is authorized
    if (interview.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to complete this interview');
    }

    interview.status = 'Completed';
    interview.feedback = feedback;
    interview.rating = rating;

    const updatedInterview = await interview.save();

    // Add feedback to application
    const application = await Application.findById(interview.application);
    if (application) {
      application.feedback.push({
        comment: feedback,
        rating,
        stage: `Interview (${interview.type})`,
      });
      await application.save();
    }

    res.json(updatedInterview);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

// @desc    Cancel interview
// @route   PUT /api/interviews/:id/cancel
// @access  Private/Recruiter
const cancelInterview = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const interview = await Interview.findById(req.params.id);

  if (interview) {
    // Check if the recruiter is authorized
    if (interview.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this interview');
    }

    interview.status = 'Cancelled';
    interview.notes = reason || interview.notes;

    const updatedInterview = await interview.save();

    // Get applicant email
    const applicant = await User.findById(interview.applicant);
    const job = await Job.findById(interview.job);

    // Send email notification to applicant
    if (applicant && applicant.email) {
      await sendEmail({
        to: applicant.email,
        subject: `Interview Cancelled for ${job.title}`,
        html: `
          <h1>Interview Cancelled</h1>
          <p>Your interview for the position of ${job.title} at ${job.company} has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Please login to your dashboard for more details.</p>
        `,
      });
    }

    res.json(updatedInterview);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

export {
  scheduleInterview,
  getRecruiterInterviews,
  getApplicantInterviews,
  getInterviewById,
  updateInterview,
  completeInterview,
  cancelInterview,
};