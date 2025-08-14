// routes/about.js
const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Routes
//router.put('/update', upload.fields([{ name: 'image', maxCount: 1 }]), aboutController.updateAbout);
router.get('/', aboutController.getAbout);
router.put('/', upload.fields([{ name: 'image', maxCount: 1 }]), aboutController.updateAbout);



module.exports = router;
