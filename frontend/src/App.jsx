import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './slices/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Job Seeker Pages
import JobSeekerDashboard from './pages/jobSeeker/Dashboard';
import JobSeekerProfile from './pages/jobSeeker/Profile';
import JobSeekerApplications from './pages/jobSeeker/Applications';
import JobSeekerInterviews from './pages/jobSeeker/Interviews';
import JobSeekerAssessments from './pages/jobSeeker/Assessments';
import JobSeekerReferrals from './pages/jobSeeker/Referrals';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterProfile from './pages/recruiter/Profile';
import RecruiterJobs from './pages/recruiter/Jobs';
import RecruiterJobCreate from './pages/recruiter/JobCreate';
import RecruiterJobEdit from './pages/recruiter/JobEdit';
import RecruiterApplications from './pages/recruiter/Applications';
import RecruiterCandidates from './pages/recruiter/Candidates';
import RecruiterInterviews from './pages/recruiter/Interviews';
import RecruiterAssessments from './pages/recruiter/Assessments';
import RecruiterReferrals from './pages/recruiter/Referrals';
import RecruiterAnalytics from './pages/recruiter/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userInfo, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* Job Seeker Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['jobSeeker']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<JobSeekerDashboard />} />
        <Route path="profile" element={<JobSeekerProfile />} />
        <Route path="applications" element={<JobSeekerApplications />} />
        <Route path="interviews" element={<JobSeekerInterviews />} />
        <Route path="assessments" element={<JobSeekerAssessments />} />
        <Route path="referrals" element={<JobSeekerReferrals />} />
      </Route>

      {/* Recruiter Routes */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="profile" element={<RecruiterProfile />} />
        <Route path="jobs" element={<RecruiterJobs />} />
        <Route path="jobs/create" element={<RecruiterJobCreate />} />
        <Route path="jobs/edit/:id" element={<RecruiterJobEdit />} />
        <Route path="applications" element={<RecruiterApplications />} />
        <Route path="candidates" element={<RecruiterCandidates />} />
        <Route path="interviews" element={<RecruiterInterviews />} />
        <Route path="assessments" element={<RecruiterAssessments />} />
        <Route path="referrals" element={<RecruiterReferrals />} />
        <Route path="analytics" element={<RecruiterAnalytics />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;