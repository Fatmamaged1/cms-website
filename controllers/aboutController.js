// controllers/aboutController.js
const AboutService = require('../services/AboutService');
const About = require('../models/About');

// Helper function to create image object from file
const createImageObject = (file, req) => ({
  url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
  alt: file.originalname || '',
  size: file.size || 0,
  mimeType: file.mimetype || '',
  uploadedAt: new Date()
});

exports.updateAbout = async (req, res, next) => {
    try {
      const data = { ...req.body }; // نسخ البيانات
      const files = req.files;

      // Parse JSON strings to objects
      const jsonFields = ['content', 'proud', 'mission', 'vision', 'stats', 'features'];
      for (const field of jsonFields) {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch (err) {
            return res.status(400).json({ status: 'error', message: `Invalid ${field} JSON` });
          }
        }
      }

      // Validate features is an array if present
      if (data.features && !Array.isArray(data.features)) {
        return res.status(400).json({ status: 'error', message: 'Features must be an array' });
      }

      // Handle image uploads - support both old 'image' field and new specific fields
      // Legacy single image field
      if (files?.image?.[0]) {
        data.image = createImageObject(files.image[0], req);
      }

      // New specific image fields from dashboard
      if (files?.proudImage?.[0]) {
        data.proudImage = createImageObject(files.proudImage[0], req);
      }
      if (files?.missionImage?.[0]) {
        data.missionImage = createImageObject(files.missionImage[0], req);
      }
      if (files?.visionImage?.[0]) {
        data.visionImage = createImageObject(files.visionImage[0], req);
      }

      // تحديث أو إنشاء
      let about = await About.findOne({ language: data.language || 'en' });
      if (about) {
        about = await About.findByIdAndUpdate(about._id, { $set: data }, { new: true });
      } else {
        about = await About.create(data);
      }

      res.status(200).json({ success: true, status: 'success', data: about });
    } catch (error) {
      next(error);
    }
  };
  
exports.getAbout = async (req, res, next) => {
  try {
    const language = req.query.lang || 'en';
    const about = await AboutService.getAbout(language);
    res.status(200).json({
      status: 'success',
      data: about
    });
  } catch (error) {
    next(error);
  }
};
