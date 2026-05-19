const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, authorize('admin'), getOverview);

module.exports = router;
