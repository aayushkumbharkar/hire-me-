const { validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Apply to a job
const applyToJob = async (req, res) => {
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

    const { jobId, coverLetter, expectedSalary, availableFrom } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Job is no longer available'
      });
    }

    // Check if job has expired
    if (job.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user is trying to apply to their own job
    if (job.employerId.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.userId,
      isActive: true
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application data
    const applicationData = {
      jobId,
      applicantId: req.userId,
      employerId: job.employerId,
      coverLetter: coverLetter.trim()
    };

    // Add optional fields
    if (expectedSalary && expectedSalary.amount) {
      applicationData.expectedSalary = {
        amount: expectedSalary.amount,
        currency: expectedSalary.currency || 'USD',
        period: expectedSalary.period || 'yearly'
      };
    }

    if (availableFrom) {
      applicationData.availableFrom = new Date(availableFrom);
    }

    // Add resume from user profile if available
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (user && user.resume) {
      applicationData.resume = user.resume;
    }

    const application = new Application(applicationData);
    await application.save();

    // Populate application data
    await application.populate([
      { path: 'jobId', select: 'title company location' },
      { path: 'applicantId', select: 'name email phone location skills' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application
      }
    });

  } catch (error) {
    console.error('Apply to job error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's applications
const getUserApplications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'all',
      sortBy = '-createdAt' 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    };

    if (status !== 'all') {
      options.status = status;
    }

    const applications = await Application.getByApplicant(req.userId, options);
    const totalApplications = await Application.countDocuments({
      applicantId: req.userId,
      isActive: true,
      ...(status !== 'all' && { status })
    });

    res.json({
      success: true,
      message: 'Applications retrieved successfully',
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalApplications / parseInt(limit)),
          totalApplications,
          hasNextPage: parseInt(page) < Math.ceil(totalApplications / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get applications for a job (Employer only)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status = 'all',
      sortBy = '-createdAt' 
    } = req.query;

    // Check if job exists and belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view applications for your own jobs.'
      });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    };

    if (status !== 'all') {
      options.status = status;
    }

    const applications = await Application.getByJob(jobId, options);
    const totalApplications = await Application.countDocuments({
      jobId,
      isActive: true,
      ...(status !== 'all' && { status })
    });

    res.json({
      success: true,
      message: 'Job applications retrieved successfully',
      data: {
        applications,
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalApplications / parseInt(limit)),
          totalApplications,
          hasNextPage: parseInt(page) < Math.ceil(totalApplications / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update application status (Employer only)
const updateApplicationStatus = async (req, res) => {
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

    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the employer for this application
    if (application.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update applications for your own jobs.'
      });
    }

    // Update application status
    await application.updateStatus(status, req.userId, notes);

    // Populate application data
    await application.populate([
      { path: 'jobId', select: 'title company location' },
      { path: 'applicantId', select: 'name email phone location skills' }
    ]);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application
      }
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Withdraw application (Job Seeker only)
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.applicantId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only withdraw your own applications.'
      });
    }

    // Check if application can be withdrawn
    if (!application.canBeWithdrawn()) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be withdrawn at this stage'
      });
    }

    // Soft delete application
    application.isActive = false;
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single application by ID
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('jobId', 'title company location salary jobType workMode')
      .populate('applicantId', 'name email phone location skills resume profileImage bio')
      .populate('employerId', 'name company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check access permissions
    const isApplicant = application.applicantId._id.toString() === req.userId.toString();
    const isEmployer = application.employerId._id.toString() === req.userId.toString();

    if (!isApplicant && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own applications.'
      });
    }

    res.json({
      success: true,
      message: 'Application retrieved successfully',
      data: {
        application
      }
    });

  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get application statistics for employer
const getApplicationStats = async (req, res) => {
  try {
    const employerId = req.userId;

    const stats = await Application.getStatistics(employerId);

    res.json({
      success: true,
      message: 'Application statistics retrieved successfully',
      data: stats[0] || { statusCounts: [], totalApplications: 0 }
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  applyToJob,
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById,
  getApplicationStats
};
