/**
 * AI Routes - Content Generation Endpoints
 */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

// Generate blog content
router.post('/generate/blog', aiController.generateBlog);

// Generate service content
router.post('/generate/service', aiController.generateService);

// Generate career/job posting content
router.post('/generate/career', aiController.generateCareer);

// Generate about page content
router.post('/generate/about', aiController.generateAbout);

module.exports = router;
