const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const PageContent = require('../models/PageContent');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { handleMultipleUploads, fileService ,handleUpload} = require('../services/upload');
const { processContentUploads, cleanupOrphanedFiles } = require('../middleware/contentUpload');
const homeController = require('../controllers/homeController');
const { isAdmin, isAuthenticated } = require('../middleware/auth');

// Configure multer for file uploads
const upload = handleMultipleUploads([
  // Home page uploads
  { name: 'backgroundImage', maxCount: 1 },
  { name: 'sections.hero.backgroundImage', maxCount: 1 },
  { name: 'sections.about.image', maxCount: 1 },
  { name: 'sections.services.backgroundImage', maxCount: 1 },
  { name: 'sections.cta.backgroundImage', maxCount: 1 },
  { name: 'sections.contact.backgroundImage', maxCount: 1 },
  { name: 'sections.features[].icon', maxCount: 10 },
  { name: 'sections.testimonials[].avatar', maxCount: 10 },
  
  // General page uploads
  { name: 'featuredImage', maxCount: 1 },
  { name: 'content.blocks[].data.file', maxCount: 10 },
  { name: 'content.blocks[].data.items[].image', maxCount: 20 },
  { name: 'gallery', maxCount: 10 },
  { name: 'meta.ogImage', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Middleware to set language
const setLanguage = (req, res, next) => {
  req.language = req.query.lang || req.acceptsLanguages(['en', 'ar']) || 'en';
  next();
};

// Apply language middleware to all routes
router.use(setLanguage);

/**
 * @swagger
 * /api/v1/pages/home:
 *   get:
 *     summary: Get home page content
 *     tags: [Pages]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *         description: Language code (en/ar)
 *     responses:
 *       200:
 *         description: Home page content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomePage'
 */
router.get('/home', homeController.getHomePage);

/**
 * @swagger
 * /api/v1/pages/home:
 *   put:
 *     summary: Update home page content (Admin)
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *         description: Language code (en/ar)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Page title
 *               seo:
 *                 type: object
 *                 description: SEO metadata
 *               sections:
 *                 type: object
 *                 description: Page sections to update
 *               isActive:
 *                 type: boolean
 *                 description: Whether the page is active
 *               'sections.hero.backgroundImage':
 *                 type: string
 *                 format: binary
 *               'sections.about.image':
 *                 type: string
 *                 format: binary
 *               'sections.services.backgroundImage':
 *                 type: string
 *                 format: binary
 *               'sections.cta.backgroundImage':
 *                 type: string
 *                 format: binary
 *               'sections.contact.backgroundImage':
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Home page updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomePage'
 */
router.put(
  '/home',
  
  upload,
  [
    body('title').optional().isString().trim(),
    body('seo').optional().isObject(),
    body('sections').optional().isObject(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  homeController.updateHomePage
);

/**
 * @swagger
 * /api/v1/pages/{pageType}:
 *   get:
 *     summary: Get page by type
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: pageType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [about, services, blog, careers, contact]
 *         description: Type of the page
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *         description: Language code (en/ar)
 *     responses:
 *       200:
 *         description: Page content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PageContent'
 */
router.get(
  '/:pageType',
  [
    param('pageType')
      .isIn(['about', 'services', 'blog', 'careers', 'contact'])
      .withMessage('Invalid page type. Must be one of: about, services, blog, careers, contact'),
    setLanguage
  ],
  validateRequest,
  async (req, res, next) => {
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
