import asyncHandler from 'express-async-handler';
import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private/JobSeeker
const createApplication = asyncHandler(async (req, res) => {
  const { jobId, resumeUrl, coverLetter, referredBy } = req.body;

  // Check if job exists and is open
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.status !== 'Open') {
    res.status(400);
    throw new Error('Job is not open for applications');
  }

  if (job.deadline < new Date()) {
    res.status(400);
    throw new Error('Application deadline has passed');
  }

  // Check if user has already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user._id,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied for this job');
  }

  // Create application
  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    recruiter: job.recruiter,
    resumeUrl,
    coverLetter,
    referredBy,
  });

  // Update job applications count
  job.applicationsCount += 1;
  await job.save();

  // Get recruiter email
  const recruiter = await User.findById(job.recruiter);

  // Send email notification to recruiter
  if (recruiter && recruiter.email) {
    await sendEmail({
      to: recruiter.email,
      subject: `New Application for ${job.title}`,
      html: `
        <h1>New Application Received</h1>
        <p>A new application has been submitted for the position of ${job.title}.</p>
        <p>Applicant: ${req.user.name}</p>
        <p>Please login to your dashboard to review the application.</p>
      `,
    });
  }

  res.status(201).json(application);
});

// @desc    Get all applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private/Recruiter
const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the job belongs to the recruiter
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these applications');
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate('applicant', 'name email skills experience location')
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'title company location')
    .populate('applicant', 'name email skills experience location')
    .populate('recruiter', 'name email company');

  if (application) {
    // Check if user is authorized to view this application
    if (
      application.applicant._id.toString() !== req.user._id.toString() &&
      application.recruiter._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this application');
    }

    res.json(application);
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Recruiter
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const application = await Application.findById(req.params.id);

  if (application) {
    // Check if the recruiter is authorized
    if (application.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this application');
    }

    application.status = status;

    const updatedApplication = await application.save();

    // Get applicant email
    const applicant = await User.findById(application.applicant);

    // Send email notification to applicant
    if (applicant && applicant.email) {
      const job = await Job.findById(application.job);
      
      await sendEmail({
        to: applicant.email,
        subject: `Application Status Update for ${job.title}`,
        html: `
          <h1>Application Status Update</h1>
          <p>Your application for the position of ${job.title} at ${job.company} has been updated.</p>
          <p>New Status: <strong>${status}</strong></p>
          <p>Please login to your dashboard for more details.</p>
        `,
      });
    }

    res.json(updatedApplication);
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Add feedback to application
// @route   POST /api/applications/:id/feedback
// @access  Private/Recruiter
const addApplicationFeedback = asyncHandler(async (req, res) => {
  const { comment, rating, stage } = req.body;

  const application = await Application.findById(req.params.id);

  if (application) {
    // Check if the recruiter is authorized
    if (application.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to add feedback to this application');
    }

    const feedback = {
      comment,
      rating,
      stage,
    };

    application.feedback.push(feedback);

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Get user applications
// @route   GET /api/applications/user
// @access  Private/JobSeeker
const getUserApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location status')
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Get recruiter applications
// @route   GET /api/applications/recruiter
// @access  Private/Recruiter
const getRecruiterApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ recruiter: req.user._id })
    .populate('job', 'title company location')
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Rank applications for a job
// @route   GET /api/applications/job/:jobId/rank
// @access  Private/Recruiter
const rankJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the job belongs to the recruiter
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to rank these applications');
  }

  // Get all applications for the job
  const applications = await Application.find({ job: req.params.jobId })
    .populate('applicant', 'skills experience')
    .sort({ createdAt: -1 });

  // Simple ranking algorithm based on skills match and experience
  const rankedApplications = applications.map((application) => {
    let score = 0;
    
    // Skills match
    const applicantSkills = application.applicant.skills || [];
    const jobSkills = job.skills || [];
    
    const matchedSkills = applicantSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 50 : 0;
    
    // Experience match
    const experienceScore = application.applicant.experience >= job.experience.min ? 30 : 
      (application.applicant.experience / job.experience.min) * 30;
    
    // Feedback score
    const feedbackScore = application.feedback.reduce((sum, fb) => sum + fb.rating, 0) / 
      (application.feedback.length || 1) * 20;
    
    score = skillScore + experienceScore + feedbackScore;
    
    // Update application ranking
    application.ranking = Math.round(score);
    return application;
  });

  // Save updated rankings
  await Promise.all(rankedApplications.map(app => app.save()));

  // Sort by ranking
  rankedApplications.sort((a, b) => b.ranking - a.ranking);

  res.json(rankedApplications);
});

export {
  createApplication,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationFeedback,
  getUserApplications,
  getRecruiterApplications,
  rankJobApplications,
};