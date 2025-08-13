const PageContent = require('../models/PageContent');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const { NotFoundError } = require('../utils/errors');

// Default home page structure
const DEFAULT_HOME_STRUCTURE = {
  seo: {
    title: 'Home',
    metaDescription: 'Welcome to our website',
    metaKeywords: 'home, welcome',
    canonicalUrl: '/'
  },
  sections: {
    hero: {
      title: 'Welcome to Our Website',
      subtitle: 'Your Success is Our Mission',
      description: 'We provide innovative solutions to grow your business',
      backgroundImage: '/images/hero-bg.jpg',
      primaryButton: {
        text: 'Get Started',
        url: '/contact'
      },
      secondaryButton: {
        text: 'Learn More',
        url: '/about'
      }
    },
    about: {
      title: 'About Us',
      content: 'We are a team of dedicated professionals...',
      image: '/images/about.jpg',
      features: [
        { title: 'Expert Team', description: 'Certified professionals' },
        { title: 'Quality Service', description: 'Guaranteed satisfaction' },
        { title: '24/7 Support', description: 'Always here to help' }
      ]
    },
    services: {
      title: 'Our Services',
      subtitle: 'What We Offer',
      featuredServices: []
    },
    features: {
      title: 'Why Choose Us',
      items: [
        {
          icon: 'fas fa-award',
          title: 'Award Winning',
          description: 'Recognized for excellence'
        },
        {
          icon: 'fas fa-users',
          title: 'Professional Team',
          description: 'Experienced professionals'
        },
        {
          icon: 'fas fa-headset',
          title: '24/7 Support',
          description: 'Always available'
        }
      ]
    },
    testimonials: {
      title: 'What Our Clients Say',
      items: [
        {
          content: 'Great service! Highly recommended.',
          author: 'John Doe',
          position: 'CEO, Company Inc.'
        }
      ]
    },
    blog: {
      title: 'Latest News',
      subtitle: 'Our Blog',
      featuredPosts: []
    },
    contact: {
      title: 'Get In Touch',
      subtitle: 'Contact Us',
      address: '123 Business St, City, Country',
      email: 'info@example.com',
      phone: '+1 234 567 890',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=...',
      formEnabled: true
    },
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Contact us today for a free consultation',
      button: {
        text: 'Contact Us',
        url: '/contact'
      },
      backgroundImage: '/images/cta-bg.jpg'
    }
  }
};

/**
 * Get home page content
 * @route GET /api/v1/home
 */
exports.getHomePage = async (req, res, next) => {
  try {
    // Get home page content
    let homePage = await PageContent.findOne({ 
      pageType: 'home',
      isActive: true,
      ...(req.language && { language: req.language })
    }).sort({ updatedAt: -1 });

    // If no home page found with the requested language, try to get the default language
    if (!homePage) {
      homePage = await PageContent.findOne({ 
        pageType: 'home',
        isActive: true,
        language: 'en' // Default language
      }).sort({ updatedAt: -1 });
      
      // If still no home page, create a default one
      if (!homePage) {
        homePage = await PageContent.create({
          ...DEFAULT_HOME_STRUCTURE,
          pageType: 'home',
          language: req.language || 'en',
          isActive: true
        });
      }
    }

    // Get featured services
    const featuredServices = await Service.find({
      isActive: true,
      featured: true,
      ...(req.language && { language: req.language })
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(6)
      .select('title slug excerpt icon thumbnail featuredImage price');
      
    // Get latest blog posts
    const latestBlogs = await Blog.find({
      status: 'published',
      isActive: true,
      ...(req.language && { language: req.language })
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt featuredImage publishedAt author categories readingTime');
      
    // Get about page content if not already in home page
    let aboutContent = homePage.sections?.about;
    if (!aboutContent) {
      const aboutPage = await PageContent.findOne({
        pageType: 'about',
        isActive: true,
        language: req.language || 'en'
      }).select('content sections.about');
      
      if (aboutPage) {
        aboutContent = aboutPage.sections?.about || aboutPage.content;
      }
    }

    // Prepare response with all sections
    const response = {
      ...homePage.toObject(),
      sections: {
        ...homePage.sections.toObject(),
        services: {
          ...(homePage.sections?.services?.toObject?.() || homePage.sections?.services || {}),
          items: featuredServices
        },
        blog: {
          ...(homePage.sections?.blog?.toObject?.() || homePage.sections?.blog || {}),
          items: latestBlogs
        },
        about: aboutContent || homePage.sections?.about,
        // Ensure all sections exist with default values if not set
        hero: homePage.sections?.hero || DEFAULT_HOME_STRUCTURE.sections.hero,
        features: homePage.sections?.features || DEFAULT_HOME_STRUCTURE.sections.features,
        testimonials: homePage.sections?.testimonials || DEFAULT_HOME_STRUCTURE.sections.testimonials,
        cta: homePage.sections?.cta || DEFAULT_HOME_STRUCTURE.sections.cta,
        contact: homePage.sections?.contact || DEFAULT_HOME_STRUCTURE.sections.contact
      }
    };

    res.json({
      status: 'success',
      data: response
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update home page content (Admin)
 * @route PUT /api/v1/pages/home
 * @body {Object} - Home page data to update
 * @body {String} [title] - Page title
 * @body {Object} [seo] - SEO metadata
 * @body {Object} [sections] - Page sections to update
 * @body {Boolean} [isActive] - Whether the page is active
 * @returns {Object} Updated home page data
 */
exports.updateHomePage = async (req, res, next) => {
  try {
    const {
      title = 'Home',
      seo = {},
      sections = {},
      isActive = true
    } = req.body;
    
    // Validate sections structure
    const validSections = {};
    if (sections) {
      // Only allow updates to defined sections
      Object.keys(sections).forEach(section => {
        if (DEFAULT_HOME_STRUCTURE.sections[section]) {
          validSections[`sections.${section}`] = sections[section];
        }
      });
    }

    // Handle file uploads for each section
    const fileUpdates = {};
    
    // Process background images
    if (req.files) {
      Object.entries(req.files).forEach(([field, files]) => {
        if (files && files[0]) {
          const file = files[0];
          const fieldPath = field.replace(/\[/g, '.').replace(/\]/g, '');
          
          fileUpdates[`sections.${fieldPath}`] = {
            url: file.path,
            alt: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date()
          };
        }
      });
    }

    // Prepare update data
    const updateData = {
      title,
      isActive,
      updatedAt: new Date(),
      ...(Object.keys(seo).length > 0 && { seo }),
      ...fileUpdates
    };
    
    // Add section updates
    Object.entries(validSections).forEach(([key, value]) => {
      updateData[key] = value;
    });
    
    // Update or create home page
    const homePage = await PageContent.findOneAndUpdate(
      { 
        pageType: 'home', 
        language: req.language || 'en' 
      },
      updateData,
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true,
        runValidators: true
      }
    )
    .populate('sections.services.items', 'title slug excerpt icon thumbnail featuredImage price')
    .populate('sections.blog.items', 'title slug excerpt featuredImage publishedAt author categories readingTime');

    res.json({
      status: 'success',
      message: 'Home page updated successfully',
      data: homePage
    });
  } catch (error) {
    next(error);
  }
};
