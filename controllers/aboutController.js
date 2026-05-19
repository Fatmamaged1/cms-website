// controllers/aboutController.js
const AboutService = require('../services/AboutService');
const About = require('../models/About');
const { buildImageUrl } = require('../utils/imageUrl');

// Helper function to create image object from file
const createImageObject = (file, req) => ({
  url: buildImageUrl(req, file.filename),
  alt: file.originalname || '',
  size: file.size || 0,
  mimeType: file.mimetype || '',
  uploadedAt: new Date()
});

exports.updateAbout = async (req, res, next) => {
    try {
      const data = { ...req.body };
      const files = req.files;

      // Parse JSON strings to objects
      const jsonFields = ['content', 'proud', 'mission', 'vision', 'stats', 'features', 'ourStory_howWeGrew_bullets'];
      for (const field of jsonFields) {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch (err) {
            // If parsing fails, leave as string
          }
        }
      }

      // Validate features is an array if present
      if (data.features && !Array.isArray(data.features)) {
        return res.status(400).json({ status: 'error', message: 'Features must be an array' });
      }

      // Handle image uploads
      if (files?.image?.[0]) {
        data.image = createImageObject(files.image[0], req);
      }
      if (files?.proudImage?.[0]) {
        data.proudImage = createImageObject(files.proudImage[0], req);
      }
      if (files?.missionImage?.[0]) {
        data.missionImage = createImageObject(files.missionImage[0], req);
      }
      if (files?.visionImage?.[0]) {
        data.visionImage = createImageObject(files.visionImage[0], req);
      }
      if (files?.ceo_image?.[0]) {
        data.ceo_image = createImageObject(files.ceo_image[0], req);
      }
      if (files?.ourStory_image_light?.[0]) {
        data.ourStory_image_light = createImageObject(files.ourStory_image_light[0], req);
      }
      if (files?.ourStory_image_dark?.[0]) {
        data.ourStory_image_dark = createImageObject(files.ourStory_image_dark[0], req);
      }

      // Handle isActive and sortOrder for sections
      if (data.isActive !== undefined) {
        data.isActive = data.isActive === 'true' || data.isActive === true;
      }
      if (data.sortOrder !== undefined) {
        data.sortOrder = parseInt(data.sortOrder, 10);
      }

      // Handle ceo section fields
      if (data.ceo_isActive !== undefined) {
        data.ceo_isActive = data.ceo_isActive === 'true' || data.ceo_isActive === true;
      }
      if (data.ceo_sortOrder !== undefined) {
        data.ceo_sortOrder = parseInt(data.ceo_sortOrder, 10);
      }

      // Handle features section fields
      if (data.features_isActive !== undefined) {
        data.features_isActive = data.features_isActive === 'true' || data.features_isActive === true;
      }
      if (data.features_sortOrder !== undefined) {
        data.features_sortOrder = parseInt(data.features_sortOrder, 10);
      }

      // Handle ourStory section fields
      if (data.ourStory_isActive !== undefined) {
        data.ourStory_isActive = data.ourStory_isActive === 'true' || data.ourStory_isActive === true;
      }
      if (data.ourStory_sortOrder !== undefined) {
        data.ourStory_sortOrder = parseInt(data.ourStory_sortOrder, 10);
      }

      // Update or create
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

exports.updateAboutSection = async (req, res, next) => {
  try {
    const { sectionKey } = req.params;
    const data = { ...req.body };
    const files = req.files;

    // Parse JSON strings
    const jsonFields = ['features', 'ourStory_howWeGrew_bullets'];
    for (const field of jsonFields) {
      if (typeof data[field] === 'string') {
        try { data[field] = JSON.parse(data[field]); } catch (err) {}
      }
    }

    // Handle image uploads
    if (files?.image?.[0] && sectionKey === 'about') {
      data.image = createImageObject(files.image[0], req);
    }
    if (files?.ceo_image?.[0] && sectionKey === 'ceo') {
      data.ceo_image = createImageObject(files.ceo_image[0], req);
    }
    if (files?.ourStory_image_light?.[0] && sectionKey === 'ourStory') {
      data.ourStory_image_light = createImageObject(files.ourStory_image_light[0], req);
    }
    if (files?.ourStory_image_dark?.[0] && sectionKey === 'ourStory') {
      data.ourStory_image_dark = createImageObject(files.ourStory_image_dark[0], req);
    }

    // Handle isActive and sortOrder
    if (data.isActive !== undefined) {
      data.isActive = data.isActive === 'true' || data.isActive === true;
    }
    if (data.sortOrder !== undefined) {
      data.sortOrder = parseInt(data.sortOrder, 10);
    }

    // Handle section-specific isActive/sortOrder (sent as ceo_isActive, features_isActive, ourStory_isActive, etc.)
    for (const prefix of ['ceo', 'features', 'ourStory']) {
      const activeKey = `${prefix}_isActive`;
      const sortKey = `${prefix}_sortOrder`;
      if (data[activeKey] !== undefined) {
        data[activeKey] = data[activeKey] === 'true' || data[activeKey] === true;
      }
      if (data[sortKey] !== undefined) {
        data[sortKey] = parseInt(data[sortKey], 10);
      }
    }

    // Update or create
    let about = await About.findOne({ language: data.language || 'en' });
    if (about) {
      about = await About.findByIdAndUpdate(about._id, { $set: data }, { new: true });
    } else {
      about = await About.create(data);
    }

    res.status(200).json({ success: true, status: 'success', message: `Section "${sectionKey}" updated`, data: about });
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
