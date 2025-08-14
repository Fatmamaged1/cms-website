const PageContent = require('../models/PageContent');
const Service = require('../models/Service');
const { NotFoundError } = require('../utils/errors');
const AboutService = require('../services/AboutService');
const _ = require('lodash');

const DEFAULT_HOME_STRUCTURE = {
  seo: {
    title: 'Home',
    metaDescription: 'Innovative Medical Solutions for a Healthier Tomorrow',
    metaKeywords: 'medical, healthcare, orthopedic, Saudi Arabia',
    canonicalUrl: '/'
  },
  sections: {
    hero: {
      title: 'Innovative Medical Solutions for a Healthier Tomorrow',
      subtitle: 'Partnering with healthcare providers to bring quality, safety, and confidence to every procedure.',
      backgroundImage: '/images/hero-bg.jpg',
      primaryButton: { text: 'Discover Services', url: '/services' }
    },
    about: {
      title: 'Your Trusted Medical Partner in Saudi Arabia',
      image: '/images/about.jpg',
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
      features: []
    },
    services: {
      title: 'Our Services',
      subtitle: 'What We Offer',
      featuredServices: []
    },
    clients: {
      logos: []
    },
    features: []
  }
};

class PageService {

  // ------------------ GET HOME PAGE ------------------
  static async getHomePage(language) {
    let homePage = await PageContent.findOne({ pageType: 'home', language })
      .populate({
        path: 'sections.services.featuredServices',
        model: 'Service'
      });

    if (!homePage) {
      homePage = await PageContent.create({
        ...DEFAULT_HOME_STRUCTURE,
        pageType: 'home',
        slug: 'home',
        language,
        isActive: true
      });
    }

  // PageService.getHomePage
const about = await AboutService.getAbout(language);
return {
  ...homePage.toObject(),
  sections: {
    hero: homePage.sections?.hero || DEFAULT_HOME_STRUCTURE.sections.hero,
    about, // now coming from AboutService
    services: homePage.sections?.services || DEFAULT_HOME_STRUCTURE.sections.services,
    clients: homePage.sections?.clients || DEFAULT_HOME_STRUCTURE.sections.clients,
    features: homePage.sections?.features || DEFAULT_HOME_STRUCTURE.sections.features
  }
};

    return {
      ...homePage.toObject(),
      sections
    };
  }

  // ------------------ UPDATE HOME PAGE ------------------
  static async updateHomePage(language, data, files, req) {
    const { title, seo, sections = {}, isActive = true } = data;
    const finalSlug = 'Homeeee';

    let homePage = await PageContent.findOne({ pageType: 'home', language });

    // Handle uploaded files dynamically
    if (files) {
      const protocol = req.protocol;
      const host = req.get('host');

      for (const [field, fileArr] of Object.entries(files)) {
        if (Array.isArray(fileArr) && fileArr.length > 0) {
          const file = fileArr[0];
          const fieldPath = field.replace(/\[/g, '.').replace(/\]/g, '');
          const url = `${protocol}://${host}/uploads/${file.filename}`;

          // Save as object with metadata
          _.set(sections, fieldPath, {
            url,
            alt: file.originalname || '',
            size: file.size || 0,
            mimeType: file.mimetype || '',
            uploadedAt: new Date()
          });
        }
      }
    }
    for (const [field, fileArr] of Object.entries(files)) {
        if (Array.isArray(fileArr) && fileArr.length > 0) {
          const file = fileArr[0];
          const fieldPath = field.replace(/\[/g, '.').replace(/\]/g, '');
          const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      
          // Determine section type (hero or about, etc.)
          if (fieldPath.includes('hero.backgroundImage') || fieldPath.includes('about.image')) {
            // Store as object with metadata
            _.set(sections, fieldPath, {
              url,
              alt: file.originalname || '',
              size: file.size || 0,
              mimeType: file.mimetype || '',
              uploadedAt: new Date()
            });
          } else {
            // For other fields, store as URL string
            _.set(sections, fieldPath, url);
          }
        }
      }
      
    // Merge with existing or default sections
    const mergedSections = _.merge(
      {},
      homePage?.sections || DEFAULT_HOME_STRUCTURE.sections,
      sections
    );

    const updateData = {
      slug: finalSlug,
      ...(title && { title }),
      isActive,
      updatedAt: new Date(),
      ...(seo && { seo }),
      sections: mergedSections
    };

    // Update or create
    if (homePage) {
      homePage = await PageContent.findByIdAndUpdate(
        homePage._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      homePage = await PageContent.create({
        ...DEFAULT_HOME_STRUCTURE,
        ...updateData,
        pageType: 'home',
        language
      });
    }

    return homePage;
  }

  // ------------------ GET PAGE BY TYPE ------------------
  static async getPageByType(pageType, language) {
    const page = await PageContent.findOne({ pageType, language, isActive: true });
    if (!page) throw new NotFoundError('Page not found');
    return page;
  }

  // ------------------ GET PAGE BY ID ------------------
  static async getPageById(id, language) {
    const page = await PageContent.findOne({ _id: id, language, isActive: true });
    if (!page) throw new NotFoundError('Page not found');
    return page;
  }

  // ------------------ DEACTIVATE PAGE ------------------
  static async deactivatePage(id) {
    const page = await PageContent.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!page) throw new NotFoundError('Page not found');
    return page;
  }
}

module.exports = PageService;
