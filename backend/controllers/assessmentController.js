import asyncHandler from 'express-async-handler';
import Assessment from '../models/assessmentModel.js';
import AssessmentResult from '../models/assessmentResultModel.js';
import Job from '../models/jobModel.js';
import Application from '../models/applicationModel.js';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private/Recruiter
const createAssessment = asyncHandler(async (req, res) => {
  const { jobId, title, description, timeLimit, passingScore, questions } = req.body;

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the job belongs to the recruiter
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to create assessment for this job');
  }

  // Create assessment
  const assessment = await Assessment.create({
    job: jobId,
    creator: req.user._id,
    title,
    description,
    timeLimit,
    passingScore,
    questions,
  });

  res.status(201).json(assessment);
});

// @desc    Get all assessments for a job
// @route   GET /api/assessments/job/:jobId
// @access  Private/Recruiter
const getJobAssessments = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the job belongs to the recruiter
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these assessments');
  }

  const assessments = await Assessment.find({ job: req.params.jobId }).sort({
    createdAt: -1,
  });

  res.json(assessments);
});

// @desc    Get assessment by ID
// @route   GET /api/assessments/:id
// @access  Private
const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);

  if (assessment) {
    // For recruiters, return full assessment with answers
    if (req.user.role === 'recruiter') {
      const job = await Job.findById(assessment.job);
      if (job.recruiter.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this assessment');
      }
      res.json(assessment);
    } 
    // For job seekers, return assessment without correct answers
    else if (req.user.role === 'jobSeeker') {
      // Check if user has an application for this job
      const job = await Job.findById(assessment.job);
      const application = await Application.findOne({
        job: assessment.job,
        applicant: req.user._id,
      });

      if (!application) {
        res.status(403);
        throw new Error('You must apply for this job to take the assessment');
      }

      // Check if user has already taken this assessment
      const existingResult = await AssessmentResult.findOne({
        assessment: assessment._id,
        applicant: req.user._id,
      });

      if (existingResult) {
        res.status(400);
        throw new Error('You have already taken this assessment');
      }

      // Return assessment without correct answers
      const sanitizedAssessment = {
        _id: assessment._id,
        job: assessment.job,
        title: assessment.title,
        description: assessment.description,
        timeLimit: assessment.timeLimit,
        questions: assessment.questions.map(q => ({
          _id: q._id,
          text: q.text,
          type: q.type,
          options: q.options,
          points: q.points,
        })),
      };

      res.json(sanitizedAssessment);
    } else {
      res.status(403);
      throw new Error('Not authorized');
    }
  } else {
    res.status(404);
    throw new Error('Assessment not found');
  }
});

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private/Recruiter
const updateAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);

  if (assessment) {
    // Check if the assessment belongs to the recruiter
    if (assessment.creator.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this assessment');
    }

    // Check if assessment has results
    const hasResults = await AssessmentResult.findOne({
      assessment: assessment._id,
    });

    if (hasResults) {
      res.status(400);
      throw new Error('Cannot update assessment that has been taken by applicants');
    }

    assessment.title = req.body.title || assessment.title;
    assessment.description = req.body.description || assessment.description;
    assessment.timeLimit = req.body.timeLimit || assessment.timeLimit;
    assessment.passingScore = req.body.passingScore || assessment.passingScore;
    assessment.questions = req.body.questions || assessment.questions;
    assessment.active = req.body.active !== undefined ? req.body.active : assessment.active;

    const updatedAssessment = await assessment.save();
    res.json(updatedAssessment);
  } else {
    res.status(404);
    throw new Error('Assessment not found');
  }
});

// @desc    Submit assessment result
// @route   POST /api/assessments/:id/submit
// @access  Private/JobSeeker
const submitAssessmentResult = asyncHandler(async (req, res) => {
  const { answers, timeSpent } = req.body;

  const assessment = await Assessment.findById(req.params.id);

  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  // Check if user has an application for this job
  const application = await Application.findOne({
    job: assessment.job,
    applicant: req.user._id,
  });

  if (!application) {
    res.status(403);
    throw new Error('You must apply for this job to submit an assessment');
  }

  // Check if user has already taken this assessment
  const existingResult = await AssessmentResult.findOne({
    assessment: assessment._id,
    applicant: req.user._id,
  });

  if (existingResult) {
    res.status(400);
    throw new Error('You have already taken this assessment');
  }

  // Calculate score
  let totalScore = 0;
  let totalPossibleScore = 0;

  const scoredAnswers = answers.map(answer => {
    const question = assessment.questions.find(q => q._id.toString() === answer.question);
    
    if (!question) {
      return {
        ...answer,
        isCorrect: false,
        score: 0
      };
    }

    totalPossibleScore += question.points;
    
    let isCorrect = false;
    let score = 0;
    
    if (question.type === 'Multiple Choice' || question.type === 'True/False') {
      isCorrect = answer.answer === question.correctAnswer;
      score = isCorrect ? question.points : 0;
    } else if (question.type === 'Short Answer' || question.type === 'Coding') {
      // For short answer and coding questions, we'll mark them as pending for manual review
      isCorrect = false;
      score = 0;
    }
    
    totalScore += score;
    
    return {
      ...answer,
      isCorrect,
      score
    };
  });

  const percentageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
  const passed = percentageScore >= assessment.passingScore;

  // Create assessment result
  const result = await AssessmentResult.create({
    assessment: assessment._id,
    application: application._id,
    applicant: req.user._id,
    answers: scoredAnswers,
    totalScore,
    percentageScore,
    passed,
    timeSpent,
  });

  // Update application status if passed
  if (passed) {
    application.status = 'Shortlisted';
    await application.save();
  }

  // Notify recruiter
  const job = await Job.findById(assessment.job);
  const recruiter = await User.findById(job.recruiter);

  if (recruiter && recruiter.email) {
    await sendEmail({
      to: recruiter.email,
      subject: `Assessment Completed for ${job.title}`,
      html: `
        <h1>Assessment Completed</h1>
        <p>${req.user.name} has completed the assessment "${assessment.title}" for the position of ${job.title}.</p>
        <p><strong>Score:</strong> ${percentageScore.toFixed(2)}%</p>
        <p><strong>Result:</strong> ${passed ? 'Passed' : 'Failed'}</p>
        <p>Please login to your dashboard to review the results.</p>
      `,
    });
  }

  res.status(201).json(result);
});

// @desc    Get assessment results for a job
// @route   GET /api/assessments/job/:jobId/results
// @access  Private/Recruiter
const getJobAssessmentResults = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the job belongs to the recruiter
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these assessment results');
  }

  const results = await AssessmentResult.find({ 'assessment.job': req.params.jobId })
    .populate('assessment', 'title')
    .populate('applicant', 'name email')
    .populate('application')
    .sort({ createdAt: -1 });

  res.json(results);
});

// @desc    Get assessment result by ID
// @route   GET /api/assessments/results/:id
// @access  Private
const getAssessmentResultById = asyncHandler(async (req, res) => {
  const result = await AssessmentResult.findById(req.params.id)
    .populate('assessment')
    .populate('applicant', 'name email')
    .populate('application');

  if (result) {
    // Check if user is authorized to view this result
    if (req.user.role === 'recruiter') {
      const job = await Job.findById(result.assessment.job);
      if (job.recruiter.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this assessment result');
      }
    } else if (req.user.role === 'jobSeeker') {
      if (result.applicant._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this assessment result');
      }
    }

    res.json(result);
  } else {
    res.status(404);
    throw new Error('Assessment result not found');
  }
});

// @desc    Update assessment result (for manual grading)
// @route   PUT /api/assessments/results/:id
// @access  Private/Recruiter
const updateAssessmentResult = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  const result = await AssessmentResult.findById(req.params.id)
    .populate('assessment');

  if (result) {
    // Check if the recruiter is authorized
    const job = await Job.findById(result.assessment.job);
    if (job.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this assessment result');
    }

    // Update scores for manually graded questions
    let totalScore = 0;
    let totalPossibleScore = 0;

    const updatedAnswers = result.answers.map(answer => {
      const updatedAnswer = answers.find(a => a.question === answer.question.toString());
      const question = result.assessment.questions.find(q => q._id.toString() === answer.question.toString());
      
      totalPossibleScore += question.points;
      
      if (updatedAnswer && (question.type === 'Short Answer' || question.type === 'Coding')) {
        answer.isCorrect = updatedAnswer.isCorrect;
        answer.score = updatedAnswer.isCorrect ? question.points : 0;
      }
      
      totalScore += answer.score;
      
      return answer;
    });

    const percentageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
    const passed = percentageScore >= result.assessment.passingScore;

    result.answers = updatedAnswers;
    result.totalScore = totalScore;
    result.percentageScore = percentageScore;
    result.passed = passed;

    const updatedResult = await result.save();

    // Update application status if passed
    if (passed) {
      const application = await Application.findById(result.application);
      if (application && application.status !== 'Shortlisted') {
        application.status = 'Shortlisted';
        await application.save();
      }
    }

    res.json(updatedResult);
  } else {
    res.status(404);
    throw new Error('Assessment result not found');
  }
});

export {
  createAssessment,
  getJobAssessments,
  getAssessmentById,
  updateAssessment,
  submitAssessmentResult,
  getJobAssessmentResults,
  getAssessmentResultById,
  updateAssessmentResult,
};