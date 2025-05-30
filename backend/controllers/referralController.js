import asyncHandler from 'express-async-handler';
import Referral from '../models/referralModel.js';
import Job from '../models/jobModel.js';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new referral
// @route   POST /api/referrals
// @access  Private
const createReferral = asyncHandler(async (req, res) => {
  const { jobId, candidateName, candidateEmail, candidatePhone, resumeUrl, relationship, notes } = req.body;

  // Check if job exists and is open
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.status !== 'Open') {
    res.status(400);
    throw new Error('Job is not open for referrals');
  }

  // Check if candidate has already been referred for this job
  const existingReferral = await Referral.findOne({
    job: jobId,
    'candidate.email': candidateEmail,
  });

  if (existingReferral) {
    res.status(400);
    throw new Error('This candidate has already been referred for this job');
  }

  // Create referral
  const referral = await Referral.create({
    job: jobId,
    referrer: req.user._id,
    candidate: {
      name: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      resumeUrl,
    },
    relationship,
    notes,
  });

  // Get recruiter email
  const recruiter = await User.findById(job.recruiter);

  // Send email notification to recruiter
  if (recruiter && recruiter.email) {
    await sendEmail({
      to: recruiter.email,
      subject: `New Referral for ${job.title}`,
      html: `
        <h1>New Referral Received</h1>
        <p>A new candidate has been referred for the position of ${job.title}.</p>
        <p><strong>Candidate:</strong> ${candidateName}</p>
        <p><strong>Referred by:</strong> ${req.user.name}</p>
        <p>Please login to your dashboard to review the referral.</p>
      `,
    });
  }

  // Send email invitation to candidate
  await sendEmail({
    to: candidateEmail,
    subject: `You've been referred for a job at ${job.company}`,
    html: `
      <h1>Job Referral</h1>
      <p>Hello ${candidateName},</p>
      <p>You have been referred by ${req.user.name} for the position of ${job.title} at ${job.company}.</p>
      <p><strong>Job Description:</strong> ${job.description}</p>
      <p>Please create an account on our platform to apply for this position.</p>
      <p>When you apply, please mention that you were referred by ${req.user.name}.</p>
    `,
  });

  res.status(201).json(referral);
});

// @desc    Get all referrals for a job
// @route   GET /api/referrals/job/:jobId
// @access  Private/Recruiter
const getJobReferrals = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the job belongs to the recruiter
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these referrals');
  }

  const referrals = await Referral.find({ job: req.params.jobId })
    .populate('referrer', 'name email')
    .populate('application')
    .sort({ createdAt: -1 });

  res.json(referrals);
});

// @desc    Get user referrals
// @route   GET /api/referrals/user
// @access  Private
const getUserReferrals = asyncHandler(async (req, res) => {
  const referrals = await Referral.find({ referrer: req.user._id })
    .populate('job', 'title company')
    .populate('application')
    .sort({ createdAt: -1 });

  res.json(referrals);
});

// @desc    Update referral status
// @route   PUT /api/referrals/:id/status
// @access  Private/Recruiter
const updateReferralStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const referral = await Referral.findById(req.params.id).populate('job');

  if (referral) {
    // Check if the recruiter is authorized
    const job = await Job.findById(referral.job);
    if (job.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this referral');
    }

    referral.status = status;

    // If status is 'Hired', update reward eligibility
    if (status === 'Hired') {
      referral.reward.eligible = true;
      referral.reward.amount = 500; // Default reward amount
    }

    const updatedReferral = await referral.save();

    // Send email notification to referrer
    const referrer = await User.findById(referral.referrer);
    if (referrer && referrer.email) {
      await sendEmail({
        to: referrer.email,
        subject: `Referral Status Update for ${job.title}`,
        html: `
          <h1>Referral Status Update</h1>
          <p>The status of your referral for ${referral.candidate.name} to the position of ${job.title} has been updated.</p>
          <p><strong>New Status:</strong> ${status}</p>
          ${status === 'Hired' ? '<p>Congratulations! Your referral has been hired. You are eligible for a referral reward.</p>' : ''}
          <p>Please login to your dashboard for more details.</p>
        `,
      });
    }

    res.json(updatedReferral);
  } else {
    res.status(404);
    throw new Error('Referral not found');
  }
});

// @desc    Update referral reward
// @route   PUT /api/referrals/:id/reward
// @access  Private/Recruiter
const updateReferralReward = asyncHandler(async (req, res) => {
  const { amount, paid } = req.body;

  const referral = await Referral.findById(req.params.id).populate('job');

  if (referral) {
    // Check if the recruiter is authorized
    const job = await Job.findById(referral.job);
    if (job.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this referral reward');
    }

    if (amount) {
      referral.reward.amount = amount;
    }

    if (paid !== undefined) {
      referral.reward.paid = paid;
      if (paid) {
        referral.reward.paidDate = new Date();
      }
    }

    const updatedReferral = await referral.save();

    // Send email notification to referrer if reward is paid
    if (paid) {
      const referrer = await User.findById(referral.referrer);
      if (referrer && referrer.email) {
        await sendEmail({
          to: referrer.email,
          subject: `Referral Reward for ${job.title}`,
          html: `
            <h1>Referral Reward</h1>
            <p>Congratulations! Your referral reward for referring ${referral.candidate.name} to the position of ${job.title} has been processed.</p>
            <p><strong>Reward Amount:</strong> $${referral.reward.amount}</p>
            <p>Thank you for your contribution to our team!</p>
          `,
        });
      }
    }

    res.json(updatedReferral);
  } else {
    res.status(404);
    throw new Error('Referral not found');
  }
});

export {
  createReferral,
  getJobReferrals,
  getUserReferrals,
  updateReferralStatus,
  updateReferralReward,
};