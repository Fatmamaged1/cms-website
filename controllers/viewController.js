const path = require('path');
const PageContent = require('../models/PageContent');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const { NotFoundError } = require('../utils/errors');

/**
 * Render home page
 */
exports.renderHomePage = async (req, res, next) => {
  try {
    // Get home page content
    const homePage = await PageContent.findOne({ 
      pageType: 'home',
      isActive: true,
      language: req.language || 'en'
    }).sort({ updatedAt: -1 });

    if (!homePage) {
      return res.status(404).render('error/404', {
        title: 'Page Not Found',
        message: 'Home page content not found'
      });
    }

    // Get featured services
    const featuredServices = await Service.find({
      isActive: true,
      featured: true,
      language: req.language || 'en'
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(6)
      .select('title slug excerpt icon thumbnail featuredImage');

    // Get latest blog posts
    const latestBlogs = await Blog.find({
      status: 'published',
      isActive: true,
      language: req.language || 'en'
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt featuredImage publishedAt author categories');

    // Get about page content for the about section
    const aboutPage = await PageContent.findOne({
      pageType: 'about',
      isActive: true,
      language: req.language || 'en'
    }).select('title content sections.about');

    // Get contact page content for the contact section
    const contactPage = await PageContent.findOne({
      pageType: 'contact',
      isActive: true,
      language: req.language || 'en'
    }).select('sections.contact content.meta.contactInfo');

    // Render the page with all the data
    res.render('pages/home', {
      title: homePage.title || 'Home',
      seo: homePage.seo || {},
      sections: {
        ...homePage.sections.toObject(),
        about: aboutPage?.sections?.about || {},
        services: {
          ...homePage.sections.services,
          items: featuredServices
        },
        latestBlogs: {
          ...homePage.sections.latestBlogs,
          items: latestBlogs
        },
        contact: {
          ...homePage.sections.contact,
          ...contactPage?.sections?.contact,
          contactInfo: contactPage?.content?.meta?.contactInfo || {}
        }
      },
      currentLanguage: req.language || 'en',
      availableLanguages: ['en', 'ar'] // Add more languages as needed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render dynamic pages (about, services, etc.)
 */
exports.renderPage = async (req, res, next) => {
  try {
    const { pageType } = req.params;
    
    const page = await PageContent.findOne({
      pageType,
      isActive: true,
      language: req.language || 'en'
    }).sort({ updatedAt: -1 });

    if (!page) {
      return res.status(404).render('error/404', {
        title: 'Page Not Found',
        message: 'The requested page could not be found'
      });
    }

    // Get related content based on page type
    let relatedContent = null;
    
    if (pageType === 'services') {
      relatedContent = await Service.find({
        isActive: true,
        language: req.language || 'en'
      })
        .sort({ order: 1, createdAt: -1 })
        .select('title slug excerpt icon thumbnail featuredImage');
    } else if (pageType === 'blog') {
      relatedContent = await Blog.find({
        status: 'published',
        isActive: true,
        language: req.language || 'en'
      })
        .sort({ publishedAt: -1 })
        .select('title slug excerpt featuredImage publishedAt author categories');
    }

    res.render(`pages/${pageType}`, {
      title: page.title,
      content: page.content,
      seo: page.seo || {},
      sections: page.sections || {},
      relatedContent,
      currentLanguage: req.language || 'en',
      availableLanguages: ['en', 'ar']
    });
  } catch (error) {
    next(error);
  }
};
