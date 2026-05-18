const express = require('express');
const router = express.Router();
const { handleUpload } = require('../services/upload/multerConfig');
const { protect, authorize } = require('../middleware/auth');

router.post(
  '/image',
  protect,
  authorize('admin'),
  handleUpload('image', 'image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    res.json({
      status: 'success',
      data: { url: req.body.image }
    });
  }
);

module.exports = router;
