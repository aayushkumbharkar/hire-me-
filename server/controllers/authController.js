const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Register new user
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, company, phone, location, website, bio, skills } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone?.trim(),
      location: location?.trim(),
      bio: bio?.trim(),
      skills: skills || []
    };

    // Add employer-specific fields
    if (role === 'employer') {
      if (!company?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Company name is required for employers'
        });
      }
      userData.company = company.trim();
      userData.website = website?.trim();
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken({ 
      userId: user._id, 
      role: user.role,
      email: user.email 
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({ 
      userId: user._id, 
      role: user.role,
      email: user.email 
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return success response (exclude password)
    const userProfile = user.getPublicProfile();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userProfile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, location, company, website, bio, skills } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (skills !== undefined) user.skills = skills;

    // Update employer-specific fields
    if (user.role === 'employer') {
      if (company !== undefined) user.company = company.trim();
      if (website !== undefined) user.website = website.trim();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Deactivate account
const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user statistics (for dashboard)
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let stats = {
      profile: user.getPublicProfile(),
      joinedDate: user.createdAt,
      lastLogin: user.lastLogin
    };

    if (user.role === 'employer') {
      const Job = require('../models/Job');
      const Application = require('../models/Application');
      
      // Get employer statistics
      const [totalJobs, activeJobs, totalApplications] = await Promise.all([
        Job.countDocuments({ employerId: user._id }),
        Job.countDocuments({ employerId: user._id, isActive: true }),
        Application.countDocuments({ employerId: user._id, isActive: true })
      ]);

      stats.employer = {
        totalJobs,
        activeJobs,
        totalApplications
      };
    } else {
      const Application = require('../models/Application');
      
      // Get job seeker statistics
      const [totalApplications, pendingApplications, interviewApplications] = await Promise.all([
        Application.countDocuments({ applicantId: user._id, isActive: true }),
        Application.countDocuments({ applicantId: user._id, status: 'pending', isActive: true }),
        Application.countDocuments({ applicantId: user._id, status: 'interview-scheduled', isActive: true })
      ]);

      stats.jobseeker = {
        totalApplications,
        pendingApplications,
        interviewApplications
      };
    }

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  getUserStats
};
