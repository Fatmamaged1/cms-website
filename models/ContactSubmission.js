const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  // Contact information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Message details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [5000, 'Message cannot be more than 5000 characters']
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'spam'],
    default: 'new'
  },
  
  // Response tracking
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Additional metadata
  ipAddress: String,
  userAgent: String,
  referrer: String,
  
  // Custom fields (for dynamic form fields)
  customFields: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    label: String,
    fieldType: String
  }]
}, {
  timestamps: true
});

// Index for status and creation date
contactSubmissionSchema.index({ status: 1, createdAt: -1 });

// Text index for search
contactSubmissionSchema.index({
  name: 'text',
  email: 'text',
  subject: 'text',
  message: 'text',
  'customFields.value': 'text'
});

const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);

module.exports = ContactSubmission;
