const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    required: [true, 'Job type is required'],
    default: 'full-time'
  },
  workMode: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    required: [true, 'Work mode is required'],
    default: 'on-site'
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
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
  requirements: {
    experience: {
      min: {
        type: Number,
        min: [0, 'Minimum experience cannot be negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum experience cannot be negative']
      }
    },
    education: {
      type: String,
      enum: ['high-school', 'bachelor', 'master', 'phd', 'not-specified'],
      default: 'not-specified'
    },
    skills: [{
      type: String,
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters']
    }]
  },
  benefits: [{
    type: String,
    trim: true,
    maxlength: [100, 'Benefit description cannot exceed 100 characters']
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },
  applicationsCount: {
    type: Number,
    default: 0,
    min: [0, 'Applications count cannot be negative']
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: [0, 'Views count cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', company: 'text', tags: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ employerId: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });

// Validate salary range
jobSchema.pre('save', function(next) {
  if (this.salary && this.salary.min && this.salary.max) {
    if (this.salary.min > this.salary.max) {
      return next(new Error('Minimum salary cannot be greater than maximum salary'));
    }
  }
  next();
});

// Virtual for salary display
jobSchema.virtual('salaryDisplay').get(function() {
  if (!this.salary || (!this.salary.min && !this.salary.max)) {
    return 'Not specified';
  }
  
  const currency = this.salary.currency || 'USD';
  const period = this.salary.period || 'yearly';
  
  if (this.salary.min && this.salary.max) {
    return `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} / ${period}`;
  } else if (this.salary.min) {
    return `From ${currency} ${this.salary.min.toLocaleString()} / ${period}`;
  } else if (this.salary.max) {
    return `Up to ${currency} ${this.salary.max.toLocaleString()} / ${period}`;
  }
});

// Virtual for experience display
jobSchema.virtual('experienceDisplay').get(function() {
  if (!this.requirements || !this.requirements.experience) {
    return 'Not specified';
  }
  
  const { min, max } = this.requirements.experience;
  if (min !== undefined && max !== undefined) {
    return `${min}-${max} years`;
  } else if (min !== undefined) {
    return `${min}+ years`;
  } else if (max !== undefined) {
    return `Up to ${max} years`;
  }
  return 'Not specified';
});

// Method to check if job is expired
jobSchema.methods.isExpired = function() {
  return this.applicationDeadline && this.applicationDeadline < new Date();
};

// Method to increment views count
jobSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to increment applications count
jobSchema.methods.incrementApplications = function() {
  this.applicationsCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method for search functionality
jobSchema.statics.search = function(query, filters = {}) {
  const searchQuery = { isActive: true };
  
  // Text search
  if (query && query.trim()) {
    searchQuery.$text = { $search: query };
  }
  
  // Location filter
  if (filters.location) {
    searchQuery.location = new RegExp(filters.location, 'i');
  }
  
  // Work mode filter
  if (filters.workMode) {
    searchQuery.workMode = filters.workMode;
  }
  
  // Job type filter
  if (filters.jobType) {
    searchQuery.jobType = filters.jobType;
  }
  
  // Salary range filter
  if (filters.minSalary || filters.maxSalary) {
    searchQuery.$or = [];
    if (filters.minSalary) {
      searchQuery.$or.push({ 'salary.max': { $gte: filters.minSalary } });
    }
    if (filters.maxSalary) {
      searchQuery.$or.push({ 'salary.min': { $lte: filters.maxSalary } });
    }
  }
  
  // Experience filter
  if (filters.experience) {
    searchQuery['requirements.experience.min'] = { $lte: filters.experience };
  }
  
  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  return this.find(searchQuery);
};

// Ensure virtual fields are serialized
jobSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Job', jobSchema);
