const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const PageContent = require('../models/PageContent');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { handleUpload, fileService } = require('../services/upload');
const { processContentUploads, cleanupOrphanedFiles } = require('../middleware/contentUpload');

// Middleware to set language
const setLanguage = (req, res, next) => {
  // Get language from query param, header, or default to 'en'
  req.language = req.query.lang || req.acceptsLanguages(['en', 'ar']) || 'en';
  next();
};

// Get page by type (home, about, etc.)
router.get(
  '/:pageType',
  [
    param('pageType')
      .isIn(['home', 'about', 'services', 'blog', 'careers', 'contact'])
      .withMessage('Invalid page type'),
    setLanguage
  ],
  validateRequest,
  async (req, res) => {
    const { pageType } = req.params;
    const { language } = req;

    const page = await PageContent.findOne({
      pageType,
      language,
      isActive: true
    });

    if (!page) {
      throw new NotFoundError('Page not found');
    }

    res.json({
      status: 'success',
      data: page
    });
  }
);

// Get page by ID
router.get(
  '/id/:id',
  [
    param('id').isMongoId().withMessage('Invalid page ID'),
    setLanguage
  ],
  validateRequest,
  async (req, res) => {
    const { id } = req.params;
    const { language } = req;

    const page = await PageContent.findOne({
      _id: id,
      language,
      isActive: true
    });

    if (!page) {
      throw new NotFoundError('Page not found');
    }

    res.json({
      status: 'success',
      data: page
    });
  }
);

// Create or update page content (Admin only)
router.post(
    '/',
    handleUpload('featuredImage'),
    processContentUploads,
    [
      body('pageType')
        .isIn(['home', 'about', 'services', 'blog', 'careers', 'contact'])
        .withMessage('Invalid page type'),
      body('title').notEmpty().withMessage('Title is required'),
      body('content').isObject().withMessage('Content must be an object'),
      body('seo').optional().isObject(),
      body('isActive').optional().isBoolean(),
      setLanguage
    ],
    validateRequest,
    async (req, res, next) => {
      try {
        const { pageType, title, content, seo, isActive = true } = req.body;
        const { language } = req;
  
        const existingPage = await PageContent.findOne({ pageType, language });
        let oldImageUrl = null;
  
        if (existingPage?.featuredImage) {
          oldImageUrl = existingPage.featuredImage;
        }
  
        const page = new PageContent({
          pageType,
          language,
          title,
          content,
          seo,
          isActive
        });
  
        await page.save();
  
        res.status(201).json({
          status: 'success',
          data: page
        });
      } catch (error) {
        next(error);
      }
    }
  );
  


// Delete page (admin only)
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid page ID')
  ],
  validateRequest,
  async (req, res) => {
    const { id } = req.params;

    // In a real app, you would check for admin permissions here
    // if (!req.user || !req.user.isAdmin) {
    //   throw new UnauthorizedError('Not authorized to perform this action');
    // }

    const page = await PageContent.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!page) {
      throw new NotFoundError('Page not found');
    }

    res.json({
      status: 'success',
      message: 'Page deactivated successfully'
    });
  }
);

module.exports = router;
