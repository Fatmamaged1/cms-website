const PageContent = require('../models/PageContent');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
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
    //SAMPLEDATA 
    clients:[
      { name: "King Fahd Medical City", logo: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400" },
      { name: "Saudi German Hospital", logo: "https://images.unsplash.com/photo-1581092919535-6c87c1dc42a4?w=400" },
      { name: "Cairo University Hospitals", logo: "https://images.unsplash.com/photo-1504439904031-93ded9a6a44c?w=400" },
      { name: "Cleveland Clinic Abu Dhabi", logo: "https://images.unsplash.com/photo-1580281657525-6c91a75deb07?w=400" },
      { name: "Sheikh Khalifa Medical City", logo: "https://images.unsplash.com/photo-1579154204601-01588f351e90?w=400" },
      { name: "Mayo Clinic Care Network", logo: "https://images.unsplash.com/photo-1581090700227-4c4e1ee37d5c?w=400" },
      { name: "Johns Hopkins Aramco Healthcare", logo: "https://images.unsplash.com/photo-1584982827414-6d50e23d2b9f?w=400" },
      { name: "Ain Shams Specialized Hospital", logo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400" },
      { name: "Dr. Sulaiman Al Habib Medical Group", logo: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c98?w=400" },
      { name: "Dar Al Fouad Hospital", logo: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=400" },
      { name: "Saudi Red Crescent Authority", logo: "https://images.unsplash.com/photo-1576765974250-4c8de596e87d?w=400" },
      { name: "National Guard Health Affairs", logo: "https://images.unsplash.com/photo-1624890258731-4392d31fdf58?w=400" },
      { name: "Zulekha Hospital", logo: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400" },
      { name: "American Hospital Dubai", logo: "https://images.unsplash.com/photo-1583912267557-5f43a44f2c2d?w=400" },
      { name: "Prince Sultan Cardiac Center", logo: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400" },
      { name: "International Medical Center Jeddah", logo: "https://images.unsplash.com/photo-1600959907703-25f1fc1cdbb6?w=400" },
      { name: "Misr International Hospital", logo: "https://images.unsplash.com/photo-1585547413111-1c38e1dd1de0?w=400" },
      { name: "Nasser Institute Hospital", logo: "https://images.unsplash.com/photo-1597764699515-1f96e8b6e72c?w=400" },
      { name: "King Saud Medical City", logo: "https://images.unsplash.com/photo-1576765973369-56b8e5f71170?w=400" },
      { name: "Dar Al Shifa Hospital", logo: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b9?w=400" },
      { name: "Coptic Hospital Cairo", logo: "https://images.unsplash.com/photo-1600959907703-25f1fc1cdbb6?w=400" },
      { name: "Saudi German Clinics", logo: "https://images.unsplash.com/photo-1624890258590-5d2fba9ee3f2?w=400" },
      { name: "El Salam International Hospital", logo: "https://images.unsplash.com/photo-1600959907703-25f1fc1cdbb6?w=400" },
      { name: "New Kasr El Ainy Hospital", logo: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400" },
      { name: "Pre Med Research Center", logo: "https://images.unsplash.com/photo-1583912267557-5f43a44f2c2d?w=400" }
    ],
    blog: {
      title: 'Our Blog',
      subtitle: 'Latest News and Updates',
      featuredBlogs: []
    },
    features: []
  }
};

class PageService {

  // ------------------ GET HOME PAGE ------------------
  static async getHomePage(language) {
    try {
      // First try to get the home page with populated data
      let homePage = await PageContent.findOne({ pageType: 'home', language })
        .populate({
          path: 'sections.blog.featuredBlogs',
          model: 'Blog',
          select: 'title subtitle excerpt thumbnail slug featuredImage createdAt' // Only select necessary fields
        })
        .populate({
          path: 'sections.services.featuredServices',
          model: 'Service',
          select: 'title subtitle icon thumbnail slug featuredImage' // Only select necessary fields
        })
        .lean(); // Convert to plain JavaScript object

      // If no home page exists, create one with default structure
      if (!homePage) {
        homePage = await PageContent.create({
          ...DEFAULT_HOME_STRUCTURE,
          pageType: 'home',
          slug: 'home',
          language,
          isActive: true
        });
      }

      // Get about section from AboutService
      const about = await AboutService.getAbout(language);

      // Get all active services if none are featured
      let featuredServices = homePage.sections?.services?.featuredServices || [];
      if (!featuredServices || featuredServices.length === 0) {
        featuredServices = await Service.find({ isActive: true, language })
          .select('title subtitle icon thumbnail slug featuredImage')
          .limit(6) // Limit to 6 services
          .sort({ createdAt: -1 }) // Get most recent first
          .lean();
      }

      // Get latest blog posts if none are featured
      let featuredBlogs = homePage.sections?.blog?.featuredBlogs || [];
      if (!featuredBlogs || featuredBlogs.length === 0) {
        featuredBlogs = await Blog.find({ isActive: true, language })
          .sort({ createdAt: -1 }) // Get most recent first
          .select('title subtitle excerpt thumbnail slug featuredImage createdAt')
          .limit(3) // Limit to 3 blog posts
          .lean();
      }

      // Construct the response with merged data
      return {
        ...homePage,
        sections: {
          hero: homePage.sections?.hero || DEFAULT_HOME_STRUCTURE.sections.hero,
          about,
          blog: {
            ...(homePage.sections?.blog || DEFAULT_HOME_STRUCTURE.sections.blog),
            featuredBlogs
          },
          services: {
            ...(homePage.sections?.services || DEFAULT_HOME_STRUCTURE.sections.services),
            featuredServices
          },
          // Keep other sections as is
          clients: DEFAULT_HOME_STRUCTURE.sections.clients,
          features:homePage.sections?.features || DEFAULT_HOME_STRUCTURE.sections.features
        }
      };
    } catch (error) {
      console.error('Error in getHomePage:', error);
      throw error; // Re-throw the error to be handled by the controller
    }
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
