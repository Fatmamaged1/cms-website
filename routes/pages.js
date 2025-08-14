const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const pageController = require('../controllers/homeController');
const { handleMultipleUploads } = require('../services/upload/multerConfig');

// Language middleware
router.use((req, res, next) => {
  req.language = req.query.lang || req.acceptsLanguages(['en', 'ar']) || 'en';
  next();
});

// Home page routes
router.get('/home', pageController.getHomePage);
router.put(
  '/home',
  handleMultipleUploads([
    { name: 'sections.hero.backgroundImage', maxCount: 1 },
    { name: 'sections.about.image', maxCount: 1 },
    { name: 'sections.services.backgroundImage', maxCount: 1 },
  ]),
  [
    body('title').optional().isString(),
    body('seo').optional().isObject(),
    body('sections').optional().isObject(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  pageController.updateHomePage
);

// Generic page routes
router.get('/:pageType', [
  param('pageType').isIn(['about','services','blog','careers','contact']).withMessage('Invalid page type'),
], validateRequest, pageController.getPageByType);

router.get('/id/:id', [param('id').isMongoId()], validateRequest, pageController.getPageById);

router.delete('/:id', [param('id').isMongoId()], validateRequest, pageController.deactivatePage);

module.exports = router;
