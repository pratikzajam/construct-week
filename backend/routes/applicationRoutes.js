import express from 'express';
import {
  createApplication,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationFeedback,
  getUserApplications,
  getRecruiterApplications,
  rankJobApplications,
} from '../controllers/applicationController.js';
import { protect, recruiter, jobSeeker } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, jobSeeker, createApplication);
router.route('/user').get(protect, jobSeeker, getUserApplications);
router.route('/recruiter').get(protect, recruiter, getRecruiterApplications);
router.route('/job/:jobId').get(protect, recruiter, getJobApplications);
router.route('/job/:jobId/rank').get(protect, recruiter, rankJobApplications);
router.route('/:id').get(protect, getApplicationById);
router.route('/:id/status').put(protect, recruiter, updateApplicationStatus);
router.route('/:id/feedback').post(protect, recruiter, addApplicationFeedback);

export default router;