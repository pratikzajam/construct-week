import express from 'express';
import {
  scheduleInterview,
  getRecruiterInterviews,
  getApplicantInterviews,
  getInterviewById,
  updateInterview,
  completeInterview,
  cancelInterview,
} from '../controllers/interviewController.js';
import { protect, recruiter, jobSeeker } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, recruiter, scheduleInterview);
router.route('/recruiter').get(protect, recruiter, getRecruiterInterviews);
router.route('/applicant').get(protect, jobSeeker, getApplicantInterviews);
router.route('/:id').get(protect, getInterviewById).put(protect, recruiter, updateInterview);
router.route('/:id/complete').put(protect, recruiter, completeInterview);
router.route('/:id/cancel').put(protect, recruiter, cancelInterview);

export default router;