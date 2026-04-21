const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const privacyController = require('../controllers/privacyController');

router.get('/', privacyController.getAllPrivacy);
router.get('/:id', privacyController.getPrivacyById);
router.post('/', protect, privacyController.createPrivacy);
router.put('/:id', protect, privacyController.updatePrivacy);
router.delete('/:id', protect, privacyController.deletePrivacy);

module.exports = router;
