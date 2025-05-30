import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getJobSeekers,
  getRecruiters,
} from '../controllers/userController.js';
import { protect, recruiter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/job-seekers').get(protect, recruiter, getJobSeekers);
router.route('/recruiters').get(protect, recruiter, getRecruiters);

export default router;