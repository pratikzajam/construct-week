import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  getJobStats,
} from '../controllers/jobController.js';
import { protect, recruiter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getJobs).post(protect, recruiter, createJob);
router.route('/recruiter').get(protect, recruiter, getRecruiterJobs);
router.route('/stats').get(protect, recruiter, getJobStats);
router
  .route('/:id')
  .get(getJobById)
  .put(protect, recruiter, updateJob)
  .delete(protect, recruiter, deleteJob);

export default router;