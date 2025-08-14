// controllers/aboutController.js
const AboutService = require('../services/AboutService');
const About = require('../models/About');
exports.updateAbout = async (req, res, next) => {
    try {
      const data = { ...req.body }; // نسخ البيانات
      const files = req.files;
  
      // تحويل content من JSON string إلى Object إذا جاء كنص
      if (typeof data.content === 'string') {
        try {
          data.content = JSON.parse(data.content);
        } catch (err) {
          return res.status(400).json({ status: 'error', message: 'Invalid content JSON' });
        }
      }
  
      // تحويل features من JSON string إلى Array
      if (typeof data.features === 'string') {
        try {
          data.features = JSON.parse(data.features); 
          if (!Array.isArray(data.features)) {
            return res.status(400).json({ status: 'error', message: 'Features must be an array' });
          }
        } catch (err) {
          return res.status(400).json({ status: 'error', message: 'Invalid features JSON' });
        }
      }
  
      // رفع الصورة إذا وجدت
      if (files?.image?.[0]) {
        const file = files.image[0];
        data.image = {
          url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
          alt: file.originalname || '',
          size: file.size || 0,
          mimeType: file.mimetype || '',
          uploadedAt: new Date()
        };
      }
  
      // تحديث أو إنشاء
      let about = await About.findOne({ language: data.language || 'en' });
      if (about) {
        about = await About.findByIdAndUpdate(about._id, { $set: data }, { new: true });
      } else {
        about = await About.create(data);
      }
  
      res.status(200).json({ status: 'success', data: about });
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
