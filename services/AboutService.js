// services/AboutService.js
const About = require('../models/About');
const { NotFoundError } = require('../utils/errors');
const { buildImageUrl } = require('../utils/imageUrl');
const _ = require('lodash');

class AboutService {
  
  static async getAbout(language) {
    let about = await About.findOne({ language });
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
        language,
        isActive: true,
        sortOrder: 0,
        ceo_isActive: true,
        ceo_sortOrder: 1,
        features_isActive: true,
        features_sortOrder: 2,
        ourStory_isActive: true,
        ourStory_sortOrder: 3,
      });
    }

    return {
      _id: about._id,
      title: about.title,
      description: about.description,
      image: about.image,
      content: about.content,
      ceo: {
        ...(about.ceo || {}),
        isActive: about.ceo_isActive !== false,
        sortOrder: about.ceo_sortOrder ?? 1,
      },
      ourStory: {
        ...(about.ourStory || {}),
        isActive: about.ourStory_isActive !== false,
        sortOrder: about.ourStory_sortOrder ?? 3,
      },
      proud: about.proud,
      proudImage: about.proudImage,
      mission: about.mission,
      missionImage: about.missionImage,
      vision: about.vision,
      visionImage: about.visionImage,
      stats: about.stats,
      story: about.story,
      language: about.language,
      isActive: about.isActive !== false,
      sortOrder: about.sortOrder ?? 0,
      features: (about.features || []).map((f, i) => ({
        ...f,
        order: f.order ?? i,
      })),
      createdAt: about.createdAt,
      updatedAt: about.updatedAt,
    };
  }

  static async updateAbout(language, data, files, req) {
    let about = await About.findOne({ language });

    if (files?.image?.[0]) {
      const file = files.image[0];
      const url = buildImageUrl(req, file.filename);
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
