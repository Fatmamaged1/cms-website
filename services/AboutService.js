// services/AboutService.js
const About = require('../models/About');
const { NotFoundError } = require('../utils/errors');
const _ = require('lodash');

class AboutService {
  
  static async getAbout(language) {
    let about = await About.findOne({ language, isActive: true });
    if (!about) {
      about = await About.create({
        title: 'Your Trusted Medical Partner in Saudi Arabia',
        image: { url: '/images/image-1755162417434-382587244.jpg' },
        content: {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'At Premium Medical Solutions Co., we are dedicated to transforming patient care across Saudi Arabia...'
              }
            }
          ]
        },
        features: [],
        language
      });
    }
    return about;
  }

  static async updateAbout(language, data, files, req) {
    let about = await About.findOne({ language });

    if (files?.image?.[0]) {
      const file = files.image[0];
      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      data.image = {
        url,
        alt: file.originalname || '',
        size: file.size || 0,
        mimeType: file.mimetype || '',
        uploadedAt: new Date()
      };
    }

    if (about) {
      about = await About.findByIdAndUpdate(about._id, { $set: data }, { new: true });
    } else {
      about = await About.create({ ...data, language });
    }

    return about;
  }

}

module.exports = AboutService;
