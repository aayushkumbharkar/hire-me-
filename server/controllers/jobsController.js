const { validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');

// Get all jobs with pagination, search, and filters
const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      location = '',
      workMode = '',
      jobType = '',
      minSalary,
      maxSalary,
      experience,
      tags,
      sortBy = '-createdAt'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filters object
    const filters = {};
    if (location) filters.location = location;
    if (workMode) filters.workMode = workMode;
    if (jobType) filters.jobType = jobType;
    if (minSalary) filters.minSalary = parseInt(minSalary);
    if (maxSalary) filters.maxSalary = parseInt(maxSalary);
    if (experience) filters.experience = parseInt(experience);
    if (tags) filters.tags = tags.split(',').map(tag => tag.trim().toLowerCase());

    // Use search method from Job model
    const jobsQuery = Job.search(search, filters)
      .populate('employerId', 'name company location website')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    // Execute query and count
    const [jobs, totalJobs] = await Promise.all([
      jobsQuery.exec(),
      Job.search(search, filters).countDocuments()
    ]);

    // Update view counts if user is authenticated
    if (req.user && jobs.length > 0) {
      // Increment view counts asynchronously
      Promise.all(
        jobs.map(job => job.incrementViews().catch(err => console.error('Failed to increment views:', err)))
      );
    }

    res.json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: {
        jobs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalJobs / limitNum),
          totalJobs,
          hasNextPage: pageNum < Math.ceil(totalJobs / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('employerId', 'name company location website bio phone email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job is no longer available'
      });
    }

    // Increment view count
    if (!req.user || req.user._id.toString() !== job.employerId._id.toString()) {
      job.incrementViews().catch(err => console.error('Failed to increment views:', err));
    }

    res.json({
      success: true,
      message: 'Job retrieved successfully',
      data: {
        job
      }
    });

  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new job (Employer only)
const createJob = async (req, res) => {
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

    const {
      title,
      description,
      company,
      location,
      jobType,
      workMode,
      salary,
      requirements,
      benefits,
      tags,
      applicationDeadline
    } = req.body;

    // Create job data
    const jobData = {
      title: title.trim(),
      description: description.trim(),
      company: company.trim(),
      location: location.trim(),
      jobType,
      workMode,
      employerId: req.userId,
      requirements: requirements || {},
      benefits: benefits || [],
      tags: tags ? tags.map(tag => tag.trim().toLowerCase()) : []
    };

    // Add salary if provided
    if (salary && (salary.min || salary.max)) {
      jobData.salary = {
        min: salary.min || undefined,
        max: salary.max || undefined,
        currency: salary.currency || 'USD',
        period: salary.period || 'yearly'
      };
    }

    // Add application deadline if provided
    if (applicationDeadline) {
      jobData.applicationDeadline = new Date(applicationDeadline);
    }

    const job = new Job(jobData);
    await job.save();

    // Populate employer data
    await job.populate('employerId', 'name company location website');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job
      }
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update job (Employer only)
const updateJob = async (req, res) => {
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

    const { id } = req.params;
    const {
      title,
      description,
      company,
      location,
      jobType,
      workMode,
      salary,
      requirements,
      benefits,
      tags,
      applicationDeadline,
      isActive
    } = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own jobs.'
      });
    }

    // Update fields
    if (title !== undefined) job.title = title.trim();
    if (description !== undefined) job.description = description.trim();
    if (company !== undefined) job.company = company.trim();
    if (location !== undefined) job.location = location.trim();
    if (jobType !== undefined) job.jobType = jobType;
    if (workMode !== undefined) job.workMode = workMode;
    if (requirements !== undefined) job.requirements = requirements;
    if (benefits !== undefined) job.benefits = benefits;
    if (tags !== undefined) job.tags = tags.map(tag => tag.trim().toLowerCase());
    if (isActive !== undefined) job.isActive = isActive;

    // Update salary
    if (salary !== undefined) {
      if (salary && (salary.min || salary.max)) {
        job.salary = {
          min: salary.min || undefined,
          max: salary.max || undefined,
          currency: salary.currency || 'USD',
          period: salary.period || 'yearly'
        };
      } else {
        job.salary = undefined;
      }
    }

    // Update application deadline
    if (applicationDeadline !== undefined) {
      job.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : undefined;
    }

    await job.save();

    // Populate employer data
    await job.populate('employerId', 'name company location website');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job
      }
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete job (Employer only)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own jobs.'
      });
    }

    // Soft delete by setting isActive to false
    job.isActive = false;
    await job.save();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get jobs by employer
const getEmployerJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'all',
      sortBy = '-createdAt' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { employerId: req.userId };
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Execute query
    const [jobs, totalJobs] = await Promise.all([
      Job.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      message: 'Employer jobs retrieved successfully',
      data: {
        jobs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalJobs / limitNum),
          totalJobs,
          hasNextPage: pageNum < Math.ceil(totalJobs / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get job statistics for employer dashboard
const getJobStats = async (req, res) => {
  try {
    const employerId = req.userId;

    const [
      totalJobs,
      activeJobs,
      inactiveJobs,
      totalViews,
      totalApplications,
      recentJobs
    ] = await Promise.all([
      Job.countDocuments({ employerId }),
      Job.countDocuments({ employerId, isActive: true }),
      Job.countDocuments({ employerId, isActive: false }),
      Job.aggregate([
        { $match: { employerId } },
        { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } }
      ]),
      Job.aggregate([
        { $match: { employerId } },
        { $group: { _id: null, totalApplications: { $sum: '$applicationsCount' } } }
      ]),
      Job.find({ employerId, isActive: true })
        .sort('-createdAt')
        .limit(5)
        .select('title createdAt applicationsCount viewsCount')
    ]);

    const stats = {
      totalJobs,
      activeJobs,
      inactiveJobs,
      totalViews: totalViews[0]?.totalViews || 0,
      totalApplications: totalApplications[0]?.totalApplications || 0,
      recentJobs
    };

    res.json({
      success: true,
      message: 'Job statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get featured jobs
const getFeaturedJobs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const jobs = await Job.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('employerId', 'name company location website')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json({
      success: true,
      message: 'Featured jobs retrieved successfully',
      data: {
        jobs
      }
    });

  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getJobStats,
  getFeaturedJobs
};
