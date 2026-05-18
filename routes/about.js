// routes/about.js
const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Routes
router.get('/', aboutController.getAbout);

// Section-level update
router.put(
  '/sections/:sectionKey',
  protect,
  authorize('admin'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'ceo_image', maxCount: 1 },
    { name: 'ourStory_image_light', maxCount: 1 },
    { name: 'ourStory_image_dark', maxCount: 1 },
  ]),
  aboutController.updateAboutSection
);

// Full page update
router.put('/', protect, authorize('admin'), upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'proudImage', maxCount: 1 },
  { name: 'missionImage', maxCount: 1 },
  { name: 'visionImage', maxCount: 1 },
  { name: 'ceo_image', maxCount: 1 },
  { name: 'ourStory_image_light', maxCount: 1 },
  { name: 'ourStory_image_dark', maxCount: 1 },
]), aboutController.updateAbout);

module.exports = router;
