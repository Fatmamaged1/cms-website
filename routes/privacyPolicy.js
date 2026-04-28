const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const privacyController = require('../controllers/privacyController');

router.get('/', privacyController.getAllPrivacy);
router.get('/:id', privacyController.getPrivacyById);
router.post('/', protect, authorize('admin'), privacyController.createPrivacy);
router.put('/:id', protect, authorize('admin'), privacyController.updatePrivacy);
router.delete('/:id', protect, authorize('admin'), privacyController.deletePrivacy);

module.exports = router;
