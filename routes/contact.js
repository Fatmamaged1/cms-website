const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const ContactSubmission = require('../models/ContactSubmission');
const { BadRequestError } = require('../utils/errors');

// Submit contact form
router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().trim(),
    body('subject').isString().trim().notEmpty().withMessage('Subject is required'),
    body('message').isString().trim().notEmpty().withMessage('Message is required'),
    body('recaptchaToken').optional().isString().trim() // For reCAPTCHA validation
  ],
  validateRequest,
  async (req, res) => {
    const { name, email, phone, subject, message, recaptchaToken } = req.body;

    // In a real app, you would verify the reCAPTCHA token here
    // if (process.env.NODE_ENV === 'production') {
    //   const isHuman = await verifyRecaptcha(recaptchaToken);
    //   if (!isHuman) {
    //     throw new BadRequestError('reCAPTCHA verification failed');
    //   }
    // }
    // Check for potential spam
    const recentSubmissions = await ContactSubmission.countDocuments({
      $or: [
        { email, createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        { ipAddress: req.ip, createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    });

    if (recentSubmissions > 5) {
      throw new BadRequestError('Too many submissions. Please try again later.');
    }

    // Create new contact submission
    const submission = new ContactSubmission({
      name,
      email,
      phone,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      referrer: req.get('referer'),
      status: 'new'
    });

    await submission.save();

    // In a real app, you would:
    // 1. Send a confirmation email to the user
    // 2. Send a notification to the admin
    // 3. Possibly integrate with a CRM or support system

    res.status(201).json({
      status: 'success',
      message: 'Thank you for contacting us. We will get back to you soon!',
      data: {
        submissionId: submission._id,
        submittedAt: submission.createdAt
      }
    });
  }
);

// Get contact submissions (admin only)
router.get(
  '/',
  [
    // Add authentication and authorization middleware in a real app
  ],
  async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) {
      query.status = status;
    }

    const [submissions, total] = await Promise.all([
      ContactSubmission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ContactSubmission.countDocuments(query)
    ]);

    res.json({
      status: 'success',
      data: submissions,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
);

// Update submission status (admin only)
router.patch(
  '/:id/status',
  [
    // Add authentication and authorization middleware in a real app
    body('status').isIn(['new', 'in-progress', 'resolved', 'spam']),
    body('response').optional().isString().trim()
  ],
  validateRequest,
  async (req, res) => {
    const { id } = req.params;
    const { status, response } = req.body;

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      {
        status,
        $set: {
          'response.message': response,
          'response.respondedBy': req.user ? req.user._id : null,
          'response.respondedAt': new Date()
        }
      },
      { new: true }
    );

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    // In a real app, you would send an email notification to the user
    // if the status is updated to 'resolved' with a response

    res.json({
      status: 'success',
      data: submission
    });
  }
);

module.exports = router;
