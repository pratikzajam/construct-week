import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      position: user.position,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, company, position } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    company,
    position,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      position: user.position,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      position: user.position,
      skills: user.skills,
      experience: user.experience,
      location: user.location,
      bio: user.bio,
      resumeUrl: user.resumeUrl,
      profileCompleted: user.profileCompleted,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.skills = req.body.skills || user.skills;
    user.experience = req.body.experience || user.experience;
    user.location = req.body.location || user.location;
    user.bio = req.body.bio || user.bio;
    user.resumeUrl = req.body.resumeUrl || user.resumeUrl;
    
    if (user.role === 'recruiter') {
      user.company = req.body.company || user.company;
      user.position = req.body.position || user.position;
    }
    
    // Check if profile is completed
    if (user.role === 'jobSeeker') {
      user.profileCompleted = !!(user.name && user.email && user.skills.length > 0 && user.resumeUrl);
    } else {
      user.profileCompleted = !!(user.name && user.email && user.company && user.position);
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      company: updatedUser.company,
      position: updatedUser.position,
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      location: updatedUser.location,
      bio: updatedUser.bio,
      resumeUrl: updatedUser.resumeUrl,
      profileCompleted: updatedUser.profileCompleted,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all job seekers (for recruiters)
// @route   GET /api/users/job-seekers
// @access  Private/Recruiter
const getJobSeekers = asyncHandler(async (req, res) => {
  const jobSeekers = await User.find({ role: 'jobSeeker' }).select('-password');
  res.json(jobSeekers);
});

// @desc    Get all recruiters (for admin)
// @route   GET /api/users/recruiters
// @access  Private/Admin
const getRecruiters = asyncHandler(async (req, res) => {
  const recruiters = await User.find({ role: 'recruiter' }).select('-password');
  res.json(recruiters);
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getJobSeekers,
  getRecruiters,
};