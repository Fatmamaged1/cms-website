const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const termsController = require('../controllers/termsController');

router.get('/', termsController.getAllTerms);
router.get('/:id', termsController.getTermsById);
router.post('/', protect, termsController.createTerms);
router.put('/:id', protect, termsController.updateTerms);
router.delete('/:id', protect, termsController.deleteTerms);

module.exports = router;
