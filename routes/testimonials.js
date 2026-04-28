const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { handleUpload } = require('../services/upload/multerConfig');
const testimonialController = require('../controllers/testimonialController');

router.get('/', testimonialController.getAllTestimonials);
router.get('/:id', testimonialController.getTestimonialById);
router.post('/', protect, authorize('admin'), handleUpload('icon'), testimonialController.createTestimonial);
router.put('/:id', protect, authorize('admin'), handleUpload('icon'), testimonialController.updateTestimonial);
router.delete('/:id', protect, authorize('admin'), testimonialController.deleteTestimonial);

module.exports = router;
