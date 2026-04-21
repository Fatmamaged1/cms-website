const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { handleUpload } = require('../services/upload/multerConfig');
const testimonialController = require('../controllers/testimonialController');

router.get('/', testimonialController.getAllTestimonials);
router.get('/:id', testimonialController.getTestimonialById);
router.post('/', protect, handleUpload('icon'), testimonialController.createTestimonial);
router.put('/:id', protect, handleUpload('icon'), testimonialController.updateTestimonial);
router.delete('/:id', protect, testimonialController.deleteTestimonial);

module.exports = router;
