import express from 'express';
import {
  createReferral,
  getJobReferrals,
  getUserReferrals,
  updateReferralStatus,
  updateReferralReward,
} from '../controllers/referralController.js';
import { protect, recruiter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createReferral);
router.route('/user').get(protect, getUserReferrals);
router.route('/job/:jobId').get(protect, recruiter, getJobReferrals);
router.route('/:id/status').put(protect, recruiter, updateReferralStatus);
router.route('/:id/reward').put(protect, recruiter, updateReferralReward);

export default router;