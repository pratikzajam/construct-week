import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobReducer from './slices/jobSlice';
import applicationReducer from './slices/applicationSlice';
import interviewReducer from './slices/interviewSlice';
import assessmentReducer from './slices/assessmentSlice';
import referralReducer from './slices/referralSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    applications: applicationReducer,
    interviews: interviewReducer,
    assessments: assessmentReducer,
    referrals: referralReducer,
    users: userReducer,
  },
});

export default store;