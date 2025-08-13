const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant ID is required']
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    minlength: [50, 'Cover letter must be at least 50 characters long']
  },
  resume: {
    type: String, // URL to resume file
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interview-scheduled', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  expectedSalary: {
    amount: {
      type: Number,
      min: [0, 'Expected salary cannot be negative']
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  availableFrom: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= new Date();
      },
      message: 'Available from date cannot be in the past'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ applicantId: 1, createdAt: -1 });
applicationSchema.index({ employerId: 1, createdAt: -1 });
applicationSchema.index({ status: 1 });

// Virtual for expected salary display
applicationSchema.virtual('expectedSalaryDisplay').get(function() {
  if (!this.expectedSalary || !this.expectedSalary.amount) {
    return 'Not specified';
  }
  
  const { amount, currency = 'USD', period = 'yearly' } = this.expectedSalary;
  return `${currency} ${amount.toLocaleString()} / ${period}`;
});

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
});

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, reviewerId = null, notes = '') {
  this.status = newStatus;
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Method to check if application can be withdrawn
applicationSchema.methods.canBeWithdrawn = function() {
  return ['pending', 'reviewed'].includes(this.status);
};

// Static method to get applications by job with pagination
applicationSchema.statics.getByJob = function(jobId, options = {}) {
  const { page = 1, limit = 10, status, sortBy = '-createdAt' } = options;
  const skip = (page - 1) * limit;
  
  const query = { jobId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('applicantId', 'name email phone location skills resume profileImage')
    .sort(sortBy)
    .skip(skip)
    .limit(limit);
};

// Static method to get applications by applicant
applicationSchema.statics.getByApplicant = function(applicantId, options = {}) {
  const { page = 1, limit = 10, status, sortBy = '-createdAt' } = options;
  const skip = (page - 1) * limit;
  
  const query = { applicantId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('jobId', 'title company location salary jobType workMode')
    .populate('employerId', 'name company')
    .sort(sortBy)
    .skip(skip)
    .limit(limit);
};

// Static method to get application statistics
applicationSchema.statics.getStatistics = function(employerId) {
  return this.aggregate([
    { $match: { employerId: new mongoose.Types.ObjectId(employerId), isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        },
        totalApplications: { $sum: '$count' }
      }
    }
  ]);
};

// Pre-save middleware to set employerId from job
applicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.employerId) {
    try {
      const Job = mongoose.model('Job');
      const job = await Job.findById(this.jobId).select('employerId');
      if (job) {
        this.employerId = job.employerId;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save middleware to increment job applications count
applicationSchema.post('save', async function(doc, next) {
  if (doc.isNew) {
    try {
      const Job = mongoose.model('Job');
      await Job.findByIdAndUpdate(doc.jobId, {
        $inc: { applicationsCount: 1 }
      });
    } catch (error) {
      console.error('Error updating job applications count:', error);
    }
  }
  next();
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Application', applicationSchema);
