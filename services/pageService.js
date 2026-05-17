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
      console.log('[getHomePage] Fetching home page for language:', language);

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

      console.log('[getHomePage] Found document:', homePage ? 'YES' : 'NO');

      // If no home page exists, create one with default structure
      if (!homePage) {
        homePage = await PageContent.create({
          ...DEFAULT_HOME_STRUCTURE,
          pageType: 'home',
          slug: 'home',
          language,
          isActive: true
        });
        // Convert to plain object
        homePage = homePage.toObject();
      }

      // Get all active services
      const services = await Service.find({ isActive: true, language })
        .select('title subtitle icon thumbnail slug featuredImage')
        .sort({ order: 1 })
        .lean();

      // Get latest blog posts if none are featured
      let featuredBlogs = homePage.sections?.blog?.featuredBlogs || [];
      if (!featuredBlogs || featuredBlogs.length === 0) {
        featuredBlogs = await Blog.find({ isActive: true, language })
          .sort({ createdAt: -1 }) // Get most recent first
          .select('title subtitle excerpt thumbnail slug featuredImage createdAt')
          .limit(3) // Limit to 3 blog posts
          .lean();
      }

      // Helper function to extract image objects cleanly
      const getImageObject = (img, defaultUrl = "") => {
        if (!img) return { url: defaultUrl, alt: "" };
        if (typeof img === 'string') return { url: img, alt: "" };
        return { url: img.url || defaultUrl, alt: img.alt || "" };
      };

      // Extract sections with robust dynamic fallbacks
      const hero = {
        title: homePage.sections?.hero?.title || "Innovative Medical Solutions for a Healthier Tomorrow",
        subtitle: homePage.sections?.hero?.subtitle || "Partnering with healthcare providers to bring quality, safety, and confidence to every procedure.",
        backgroundImage: getImageObject(homePage.sections?.hero?.backgroundImage, "/images/hero-bg.jpg"),
        ctaText: homePage.sections?.hero?.ctaText || "Discover Services",
        ctaLink: homePage.sections?.hero?.ctaLink || "/services"
      };

      const about = {
        title: homePage.sections?.about?.title || "Your Trusted Medical Partner in Saudi Arabia",
        description: homePage.sections?.about?.description || "At Premium Medical Solutions Co., we are dedicated to transforming patient care across Saudi Arabia...",
        image: getImageObject(homePage.sections?.about?.image, "/images/about.jpg")
      };

      const ceo = {
        title: homePage.sections?.ceo?.title || "CEO Message",
        name: homePage.sections?.ceo?.name || "Dr. Islam Ali",
        role: homePage.sections?.ceo?.role || "President and Chief Executive Officer",
        quote: homePage.sections?.ceo?.quote || "At PRE-MED, we exist to elevate surgical care in Saudi Arabia through trust, expertise, and meaningful partnerships.",
        message: homePage.sections?.ceo?.message || "From day one, we set out to build more than a distribution business...",
        image: getImageObject(homePage.sections?.ceo?.image, "/Images/AboutUs/ceo-light.jpeg")
      };

      const features = homePage.sections?.features && homePage.sections.features.length > 0 ? homePage.sections.features : [
        { title: "Vision", subtitle: "Our Vision", content: "To be the leading provider of innovative orthopedic and surgical solutions...", order: 0 },
        { title: "Mission", subtitle: "Our Mission", content: "To empower healthcare professionals with superior quality tools...", order: 1 },
        { title: "Values", subtitle: "Our Core Values", content: "Integrity, Excellence, and Patient-centric Innovation...", order: 2 }
      ];

      const stats = homePage.sections?.stats && homePage.sections.stats.length > 0 ? homePage.sections.stats : [
        { title: "10+", subtitle: "Years Experience", content: "A decade of serving patients", order: 0 },
        { title: "50+", subtitle: "Partner Hospitals", content: "Leading healthcare facilities", order: 1 },
        { title: "1000+", subtitle: "Surgical Procedures", content: "Empowering successful operations", order: 2 },
        { title: "100%", subtitle: "Client Satisfaction", content: "Dedicated support and clinical care", order: 3 },
        { title: "20+", subtitle: "Global Brands", content: "World-class orthopedic systems", order: 4 },
        { title: "24/7", subtitle: "Clinical Support", content: "Always beside our partners", order: 5 }
      ];

      const ourStory = {
        title: homePage.sections?.ourStory?.title || "Our Story",
        subtitle: homePage.sections?.ourStory?.subtitle || "Driven by Purpose, Guided by Care",
        description: homePage.sections?.ourStory?.description || "PRE-MED was established with a singular vision...",
        howWeGrew: {
          title: homePage.sections?.ourStory?.howWeGrew?.title || "How We Grew:",
          bullets: homePage.sections?.ourStory?.howWeGrew?.bullets || [
            "Expanding standard clinical expertise.",
            "Deploying state-of-the-art orthopedic systems.",
            "Expanding presence to cover 20+ specialized hospitals."
          ]
        },
        image: {
          light: getImageObject(homePage.sections?.ourStory?.image?.light, "/Images/AboutUs/ceo-light.jpeg"),
          dark: getImageObject(homePage.sections?.ourStory?.image?.dark, "/Images/AboutUs/ceo-dark.jpeg")
        }
      };

      const freedom = {
        title: homePage.sections?.freedom?.title || "Reclaim Your Freedom of Motion",
        image: getImageObject(homePage.sections?.freedom?.image, "/Images/Home/new/Frame 124.webp")
      };

      const servicesSection = {
        title: homePage.sections?.services?.title || "Our Products & Services",
        subtitle: homePage.sections?.services?.subtitle || "Exploring our modern orthopedic solutions...",
        featuredServices: services
      };

      const blogSection = {
        title: homePage.sections?.blog?.title || "Our Blog",
        subtitle: homePage.sections?.blog?.subtitle || "Latest News and Updates",
        featuredBlogs
      };

      const clients = homePage.sections?.clients || DEFAULT_HOME_STRUCTURE.sections.clients;

      // Construct the response matching the exact response shape
      return {
        _id: homePage._id,
        pageType: homePage.pageType,
        slug: homePage.slug,
        language: homePage.language,
        isActive: homePage.isActive,
        seo: homePage.seo || DEFAULT_HOME_STRUCTURE.seo,
        sections: {
          hero,
          about,
          ceo,
          features,
          stats,
          ourStory,
          freedom,
          services: servicesSection,
          blog: blogSection,
          clients
        }
      };
    } catch (error) {
      console.error('Error in getHomePage:', error);
      throw error;
    }
  }

  // ------------------ UPDATE HOME PAGE ------------------
  static async updateHomePage(language, data, files, req) {
    const { title, seo, sections = {}, isActive = true } = data;
    const finalSlug = 'home';

    console.log('[updateHomePage] Language:', language);
    console.log('[updateHomePage] Incoming sections:', JSON.stringify(sections, null, 2));

    let homePage = await PageContent.findOne({ pageType: 'home', language });

    // Map dashboard field names to proper paths for uploaded files
    const fieldNameMapping = {
      'hero_backgroundImage': 'hero.backgroundImage',
      'about_image': 'about.image',
      'services_backgroundImage': 'services.backgroundImage',
      'ceo_image': 'ceo.image',
      'ourStory_image_light': 'ourStory.image.light',
      'ourStory_image_dark': 'ourStory.image.dark',
      'freedom_image': 'freedom.image'
    };

    // Reconstruct sections from flat FormData keys if they are passed flat
    const textMapping = {
      'hero_title': 'hero.title',
      'hero_subtitle': 'hero.subtitle',
      'hero_ctaText': 'hero.ctaText',
      'hero_ctaLink': 'hero.ctaLink',
      'about_title': 'about.title',
      'about_description': 'about.description',
      'ceo_title': 'ceo.title',
      'ceo_name': 'ceo.name',
      'ceo_role': 'ceo.role',
      'ceo_quote': 'ceo.quote',
      'ceo_message': 'ceo.message',
      'ourStory_title': 'ourStory.title',
      'ourStory_subtitle': 'ourStory.subtitle',
      'ourStory_description': 'ourStory.description',
      'ourStory_howWeGrew_title': 'ourStory.howWeGrew.title',
      'freedom_title': 'freedom.title',
      'services_title': 'services.title',
      'services_subtitle': 'services.subtitle',
      'blog_title': 'blog.title',
      'blog_subtitle': 'blog.subtitle'
    };

    // Map flat text keys to nested sections path
    for (const [flatKey, path] of Object.entries(textMapping)) {
      if (data[flatKey] !== undefined) {
        _.set(sections, path, data[flatKey]);
      }
    }

    // Handle JSON string fields
    const jsonFields = {
      'stats': 'stats',
      'features': 'features',
      'ourStory_howWeGrew_bullets': 'ourStory.howWeGrew.bullets'
    };

    for (const [flatKey, path] of Object.entries(jsonFields)) {
      if (data[flatKey] !== undefined) {
        try {
          const parsed = typeof data[flatKey] === 'string' ? JSON.parse(data[flatKey]) : data[flatKey];
          _.set(sections, path, parsed);
        } catch (e) {
          console.error(`Error parsing JSON for field ${flatKey}:`, e.message);
        }
      }
    }

    // Handle uploaded files dynamically
    if (files) {
      const protocol = req.protocol;
      const host = req.get('host');

      for (const [field, fileArr] of Object.entries(files)) {
        if (Array.isArray(fileArr) && fileArr.length > 0) {
          const file = fileArr[0];
          let fieldPath = fieldNameMapping[field] || field.replace(/\[/g, '.').replace(/\]/g, '');
          const url = `${protocol}://${host}/uploads/images/${file.filename}`;

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
      
    // Merge with existing sections
    const existingSections = homePage?.sections?.toObject?.() || homePage?.sections || {};
    console.log('[updateHomePage] Existing sections from DB:', JSON.stringify(existingSections, null, 2));

    const mergedSections = _.merge(
      {},
      DEFAULT_HOME_STRUCTURE.sections,
      existingSections,
      sections
    );

    console.log('[updateHomePage] Merged sections:', JSON.stringify(mergedSections, null, 2));

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
      console.log('[updateHomePage] Updating existing document ID:', homePage._id);
      homePage = await PageContent.findByIdAndUpdate(
        homePage._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      console.log('[updateHomePage] Creating new home page document');
      homePage = await PageContent.create({
        ...DEFAULT_HOME_STRUCTURE,
        ...updateData,
        pageType: 'home',
        language
      });
    }

    console.log('[updateHomePage] Saved document sections:', JSON.stringify(homePage?.sections, null, 2));
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
