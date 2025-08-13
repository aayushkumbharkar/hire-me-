const express = require('express');
const { body, param } = require('express-validator');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getJobStats,
  getFeaturedJobs
} = require('../controllers/jobsController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createJobValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('jobType')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'temporary'])
    .withMessage('Job type must be one of: full-time, part-time, contract, internship, temporary'),
  body('workMode')
    .isIn(['remote', 'on-site', 'hybrid'])
    .withMessage('Work mode must be one of: remote, on-site, hybrid'),
  body('salary.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('salary.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),
  body('salary.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Currency must be one of: USD, EUR, GBP, INR, CAD, AUD'),
  body('salary.period')
    .optional()
    .isIn(['hourly', 'monthly', 'yearly'])
    .withMessage('Salary period must be one of: hourly, monthly, yearly'),
  body('requirements.experience.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum experience must be a positive number'),
  body('requirements.experience.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum experience must be a positive number'),
  body('requirements.education')
    .optional()
    .isIn(['high-school', 'bachelor', 'master', 'phd', 'not-specified'])
    .withMessage('Education must be one of: high-school, bachelor, master, phd, not-specified'),
  body('requirements.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('requirements.skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('benefits.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each benefit must be between 1 and 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Application deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    })
];

const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'temporary'])
    .withMessage('Job type must be one of: full-time, part-time, contract, internship, temporary'),
  body('workMode')
    .optional()
    .isIn(['remote', 'on-site', 'hybrid'])
    .withMessage('Work mode must be one of: remote, on-site, hybrid'),
  body('salary.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('salary.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID format')
];

// Public routes
router.get('/', optionalAuth, getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/:id', mongoIdValidation, optionalAuth, getJobById);

// Protected routes
router.use(authenticate); // All routes below require authentication

// Employer only routes
router.post('/', authorize('employer'), createJobValidation, createJob);
router.put('/:id', mongoIdValidation, authorize('employer'), updateJobValidation, updateJob);
router.delete('/:id', mongoIdValidation, authorize('employer'), deleteJob);

// Employer dashboard routes
router.get('/employer/my-jobs', authorize('employer'), getEmployerJobs);
router.get('/employer/stats', authorize('employer'), getJobStats);

module.exports = router;
