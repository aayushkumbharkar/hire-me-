const express = require('express');
const { body, param } = require('express-validator');
const {
  applyToJob,
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById,
  getApplicationStats
} = require('../controllers/applicationsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const applyJobValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Invalid job ID format'),
  body('coverLetter')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Cover letter must be between 50 and 2000 characters'),
  body('expectedSalary.amount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Expected salary must be a positive number'),
  body('expectedSalary.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Currency must be one of: USD, EUR, GBP, INR, CAD, AUD'),
  body('expectedSalary.period')
    .optional()
    .isIn(['hourly', 'monthly', 'yearly'])
    .withMessage('Salary period must be one of: hourly, monthly, yearly'),
  body('availableFrom')
    .optional()
    .isISO8601()
    .withMessage('Available from date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Available from date cannot be in the past');
      }
      return true;
    })
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'reviewed', 'shortlisted', 'interview-scheduled', 'rejected', 'hired'])
    .withMessage('Status must be one of: pending, reviewed, shortlisted, interview-scheduled, rejected, hired'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const mongoIdValidation = [
  param('applicationId')
    .isMongoId()
    .withMessage('Invalid application ID format')
];

const jobIdValidation = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID format')
];

// All routes require authentication
router.use(authenticate);

// Job seeker routes
router.post('/', authorize('jobseeker'), applyJobValidation, applyToJob);
router.get('/user', authorize('jobseeker'), getUserApplications);
router.delete('/:applicationId/withdraw', mongoIdValidation, authorize('jobseeker'), withdrawApplication);

// Employer routes
router.get('/job/:jobId', jobIdValidation, authorize('employer'), getJobApplications);
router.put('/:applicationId/status', mongoIdValidation, authorize('employer'), updateStatusValidation, updateApplicationStatus);
router.get('/employer/stats', authorize('employer'), getApplicationStats);

// Shared routes (both job seeker and employer can access)
router.get('/:applicationId', mongoIdValidation, getApplicationById);

module.exports = router;
