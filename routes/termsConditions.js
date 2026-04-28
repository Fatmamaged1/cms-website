const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const termsController = require('../controllers/termsController');

router.get('/', termsController.getAllTerms);
router.get('/:id', termsController.getTermsById);
router.post('/', protect, authorize('admin'), termsController.createTerms);
router.put('/:id', protect, authorize('admin'), termsController.updateTerms);
router.delete('/:id', protect, authorize('admin'), termsController.deleteTerms);

module.exports = router;
