import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';
import Application from '../models/applicationModel.js';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Recruiter
const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requirements,
    location,
    type,
    salary,
    skills,
    experience,
    deadline,
    status,
  } = req.body;

  const job = await Job.create({
    recruiter: req.user._id,
    company: req.user.company,
    title,
    description,
    requirements,
    location,
    type,
    salary,
    skills,
    experience,
    deadline,
    status,
  });

  res.status(201).json(job);
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { skills: { $in: [new RegExp(req.query.keyword, 'i')] } },
        ],
      }
    : {};

  const locationFilter = req.query.location
    ? { location: { $regex: req.query.location, $options: 'i' } }
    : {};

  const typeFilter = req.query.type ? { type: req.query.type } : {};

  const experienceFilter = req.query.experience
    ? { 'experience.min': { $lte: Number(req.query.experience) } }
    : {};

  const statusFilter = { status: 'Open' };

  const filter = {
    ...keyword,
    ...locationFilter,
    ...typeFilter,
    ...experienceFilter,
    ...statusFilter,
  };

  const count = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .populate('recruiter', 'name company')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    jobs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    'recruiter',
    'name company email'
  );

  if (job) {
    res.json(job);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Recruiter
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    // Check if the job belongs to the recruiter
    if (job.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this job');
    }

    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;
    job.location = req.body.location || job.location;
    job.type = req.body.type || job.type;
    job.salary = req.body.salary || job.salary;
    job.skills = req.body.skills || job.skills;
    job.experience = req.body.experience || job.experience;
    job.deadline = req.body.deadline || job.deadline;
    job.status = req.body.status || job.status;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Recruiter
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    // Check if the job belongs to the recruiter
    if (job.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this job');
    }

    // Check if there are applications for this job
    const applications = await Application.countDocuments({ job: job._id });
    if (applications > 0) {
      res.status(400);
      throw new Error('Cannot delete job with existing applications');
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Get recruiter jobs
// @route   GET /api/jobs/recruiter
// @access  Private/Recruiter
const getRecruiterJobs = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Job.countDocuments({ recruiter: req.user._id });
  const jobs = await Job.find({ recruiter: req.user._id })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    jobs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Private/Recruiter
const getJobStats = asyncHandler(async (req, res) => {
  const totalJobs = await Job.countDocuments({ recruiter: req.user._id });
  const openJobs = await Job.countDocuments({
    recruiter: req.user._id,
    status: 'Open',
  });
  const closedJobs = await Job.countDocuments({
    recruiter: req.user._id,
    status: 'Closed',
  });
  const draftJobs = await Job.countDocuments({
    recruiter: req.user._id,
    status: 'Draft',
  });

  // Get applications per job
  const jobs = await Job.find({ recruiter: req.user._id }).select('_id title');
  const jobApplications = await Promise.all(
    jobs.map(async (job) => {
      const count = await Application.countDocuments({ job: job._id });
      return {
        jobId: job._id,
        title: job.title,
        applications: count,
      };
    })
  );

  res.json({
    totalJobs,
    openJobs,
    closedJobs,
    draftJobs,
    jobApplications,
  });
});

export {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  getJobStats,
};