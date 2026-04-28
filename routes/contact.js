const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const ContactSubmission = require('../models/ContactSubmission');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { sendConfirmationEmail } = require('../services/sendMail');
const { protect } = require('../middleware/auth');

// Submit contact form
router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().trim(),
    body('subject').isString().trim().notEmpty().withMessage('Subject is required'),
    body('message').isString().trim().notEmpty().withMessage('Message is required'),
    body('recaptchaToken').optional().isString().trim()
  ],
  validateRequest,
  async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Check for spam / rate limiting
    const recentSubmissions = await ContactSubmission.countDocuments({
      $or: [
        { email, createdAt: { $gt: new Date(Date.now() - 24*60*60*1000) } },
        { ipAddress: req.ip, createdAt: { $gt: new Date(Date.now() - 24*60*60*1000) } }
      ]
    });
    if (recentSubmissions > 5) {
      throw new BadRequestError('Too many submissions. Please try again later.');
    }

    // Save submission
    const submission = await ContactSubmission.create({
      name, email, phone, subject, message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      referrer: req.get('referer'),
      status: 'new'
    });

    // Send confirmation email asynchronously (don’t block response)
    sendConfirmationEmail(email, message).catch(err => console.error(err));

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
  protect,
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
  protect,
  [
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

// Get single contact submission (admin only)
router.get(
  '/:id',
  protect,
  async (req, res) => {
    const { id } = req.params;

    const submission = await ContactSubmission.findById(id).lean();

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    res.json({
      status: 'success',
      data: submission
    });
  }
);

// Delete contact submission (admin only)
router.delete(
  '/:id',
  protect,
  async (req, res) => {
    const { id } = req.params;

    const submission = await ContactSubmission.findByIdAndDelete(id);

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    res.json({
      status: 'success',
      message: 'Contact submission deleted successfully'
    });
  }
);

// Mark submission as read (admin only)
router.patch(
  '/:id',
  protect,
  [
    body('isRead').optional().isBoolean(),
    body('read').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    const { id } = req.params;
    // Support both 'read' and 'isRead' field names for compatibility
    const isRead = req.body.isRead ?? req.body.read;

    const updateData = {};
    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead;
      updateData.readAt = isRead ? new Date() : null;
    }

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    res.json({
      status: 'success',
      data: submission
    });
  }
);

// Reply to contact submission (admin only)
router.post(
  '/:id/reply',
  protect,
  [
    body('message').optional().isString().trim(),
    body('content').optional().isString().trim(),
    body('subject').optional().isString().trim()
  ],
  validateRequest,
  async (req, res) => {
    const { id } = req.params;
    // Support both 'message' and 'content' field names for compatibility
    const message = req.body.message || req.body.content;
    const { subject } = req.body;

    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Reply message is required' });
    }

    const submission = await ContactSubmission.findById(id);

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    // Update submission with reply info
    submission.response = {
      message,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };
    submission.status = 'resolved';
    await submission.save();

    // Send reply email
    try {
      await sendConfirmationEmail(
        submission.email,
        `
        <p>Dear ${submission.name},</p>
        <p>Thank you for reaching out to us. Here is our response to your inquiry:</p>
        <div style="background-color: #f0f8ff; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #007aff;">
          <p style="margin: 0;">${message}</p>
        </div>
        <p>If you have any further questions, please don't hesitate to contact us again.</p>
        <p>Best regards,<br>PREMED Team</p>
        `
      );
    } catch (err) {
      console.error('Error sending reply email:', err);
      // Don't fail the request if email fails
    }

    res.json({
      status: 'success',
      message: 'Reply sent successfully',
      data: submission
    });
  }
);

module.exports = router;
