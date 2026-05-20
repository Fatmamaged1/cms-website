const PageContent = require('../models/PageContent');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const { NotFoundError } = require('../utils/errors');
const { buildImageUrl } = require('../utils/imageUrl');
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
      primaryButton: { text: 'Discover Services', url: '/services' },
      isActive: true,
      sortOrder: 0
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
      features: [],
      isActive: true,
      sortOrder: 1
    },
    features: [],
    ceo: {
      title: 'CEO Message',
      name: 'Dr. Islam Ali',
      role: 'President and Chief Executive Officer',
      quote: 'At PRE-MED, we exist to elevate surgical care...',
      message: 'From day one...',
      image: '/Images/AboutUs/ceo-light.jpeg',
      isActive: true,
      sortOrder: 3
    },
    stats: [
      { title: "10+", subtitle: "Years Experience", content: "A decade of serving patients", order: 0 },
      { title: "50+", subtitle: "Partner Hospitals", content: "Leading healthcare facilities", order: 1 },
      { title: "1000+", subtitle: "Surgical Procedures", content: "Empowering successful operations", order: 2 },
      { title: "100%", subtitle: "Client Satisfaction", content: "Dedicated support and clinical care", order: 3 },
      { title: "20+", subtitle: "Global Brands", content: "World-class orthopedic systems", order: 4 },
      { title: "24/7", subtitle: "Clinical Support", content: "Always beside our partners", order: 5 }
    ],
    ourStory: {
      title: 'Our Story',
      subtitle: 'Driven by Purpose, Guided by Care',
      description: 'PRE-MED was established with a singular vision...',
      howWeGrew: {
        title: 'How We Grew:',
        bullets: ['Expanding standard clinical expertise.', 'Deploying state-of-the-art orthopedic systems.', 'Expanding presence to cover 20+ specialized hospitals.']
      },
      image: {
        light: { url: '/Images/AboutUs/ceo-light.jpeg', alt: '' },
        dark: { url: '/Images/AboutUs/ceo-dark.jpeg', alt: '' }
      },
      isActive: true,
      sortOrder: 5
    },
    freedom: {
      title: 'Reclaim Your Freedom of Motion',
      image: '/Images/Home/new/Frame 124.webp',
      isActive: true,
      sortOrder: 6
    },
    services: {
      title: 'Our Products & Services',
      subtitle: 'Exploring our modern orthopedic solutions...',
      featuredServices: [],
      isActive: true,
      sortOrder: 7
    },
    blog: {
      title: 'Our Blog',
      subtitle: 'Latest News and Updates',
      featuredBlogs: [],
      isActive: true,
      sortOrder: 8
    },
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
  }
};

class PageService {

  // ------------------ GET HOME PAGE ------------------
  static async getHomePage(language, options = {}) {
    try {
      const { includeInactive = false } = options;
      console.log('[getHomePage] Fetching home page for language:', language, 'includeInactive:', includeInactive);

      let homePage = await PageContent.findOne({ pageType: 'home', language })
        .populate({
          path: 'sections.blog.featuredBlogs',
          model: 'Blog',
          select: 'title subtitle excerpt thumbnail slug featuredImage createdAt'
        })
        .populate({
          path: 'sections.services.featuredServices',
          model: 'Service',
          select: 'title subtitle icon thumbnail slug featuredImage'
        })
        .lean();

      console.log('[getHomePage] Found document:', homePage ? 'YES' : 'NO');

      if (!homePage) {
        homePage = await PageContent.create({
          ...DEFAULT_HOME_STRUCTURE,
          pageType: 'home',
          slug: 'home',
          language,
          isActive: true
        });
        homePage = homePage.toObject();
      }

      const services = await Service.find({ isActive: true, language })
        .select('title subtitle icon thumbnail slug featuredImage')
        .sort({ order: 1 })
        .lean();

      let featuredBlogs = homePage.sections?.blog?.featuredBlogs || [];
      if (!featuredBlogs || featuredBlogs.length === 0) {
        featuredBlogs = await Blog.find({ isActive: true, language })
          .sort({ createdAt: -1 })
          .select('title subtitle excerpt thumbnail slug featuredImage createdAt')
          .limit(3)
          .lean();
      }

      const getImageObject = (img, defaultUrl = "") => {
        if (!img) return { url: defaultUrl, alt: "" };
        if (typeof img === 'string') return { url: img, alt: "" };
        return { url: img.url || defaultUrl, alt: img.alt || "" };
      };

      const ensureSectionMeta = (section, defaultSortOrder) => {
        if (!section || typeof section !== 'object' || Array.isArray(section)) return section;
        return {
          ...section,
          isActive: section.isActive !== undefined ? section.isActive : true,
          sortOrder: section.sortOrder !== undefined ? section.sortOrder : defaultSortOrder
        };
      };

      const hero = ensureSectionMeta({
        title: homePage.sections?.hero?.title || "Innovative Medical Solutions for a Healthier Tomorrow",
        subtitle: homePage.sections?.hero?.subtitle || "Partnering with healthcare providers to bring quality, safety, and confidence to every procedure.",
        backgroundImage: getImageObject(homePage.sections?.hero?.backgroundImage, "/images/hero-bg.jpg"),
        ctaText: homePage.sections?.hero?.ctaText || "Discover Services",
        ctaLink: homePage.sections?.hero?.ctaLink || "/services",
        isActive: homePage.sections?.hero?.isActive,
        sortOrder: homePage.sections?.hero?.sortOrder
      }, 0);

      const about = ensureSectionMeta({
        title: homePage.sections?.about?.title || "Your Trusted Medical Partner in Saudi Arabia",
        description: homePage.sections?.about?.description || "At Premium Medical Solutions Co., we are dedicated to transforming patient care across Saudi Arabia...",
        image: getImageObject(homePage.sections?.about?.image, "/images/about.jpg"),
        isActive: homePage.sections?.about?.isActive,
        sortOrder: homePage.sections?.about?.sortOrder
      }, 1);

      const ceo = ensureSectionMeta({
        title: homePage.sections?.ceo?.title || "CEO Message",
        name: homePage.sections?.ceo?.name || "Dr. Islam Ali",
        role: homePage.sections?.ceo?.role || "President and Chief Executive Officer",
        quote: homePage.sections?.ceo?.quote || "At PRE-MED, we exist to elevate surgical care in Saudi Arabia through trust, expertise, and meaningful partnerships.",
        message: homePage.sections?.ceo?.message || "From day one, we set out to build more than a distribution business...",
        image: getImageObject(homePage.sections?.ceo?.image, "/Images/AboutUs/ceo-light.jpeg"),
        isActive: homePage.sections?.ceo?.isActive,
        sortOrder: homePage.sections?.ceo?.sortOrder
      }, 3);

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

      const ourStory = ensureSectionMeta({
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
        },
        isActive: homePage.sections?.ourStory?.isActive,
        sortOrder: homePage.sections?.ourStory?.sortOrder
      }, 5);

      const freedom = ensureSectionMeta({
        title: homePage.sections?.freedom?.title || "Reclaim Your Freedom of Motion",
        image: getImageObject(homePage.sections?.freedom?.image, "/Images/Home/new/Frame 124.webp"),
        isActive: homePage.sections?.freedom?.isActive,
        sortOrder: homePage.sections?.freedom?.sortOrder
      }, 6);

      const servicesSection = ensureSectionMeta({
        title: homePage.sections?.services?.title || "Our Products & Services",
        subtitle: homePage.sections?.services?.subtitle || "Exploring our modern orthopedic solutions...",
        featuredServices: services,
        isActive: homePage.sections?.services?.isActive,
        sortOrder: homePage.sections?.services?.sortOrder
      }, 7);

      const blogSection = ensureSectionMeta({
        title: homePage.sections?.blog?.title || "Our Blog",
        subtitle: homePage.sections?.blog?.subtitle || "Latest News and Updates",
        featuredBlogs,
        isActive: homePage.sections?.blog?.isActive,
        sortOrder: homePage.sections?.blog?.sortOrder
      }, 8);

      const clientsMeta = homePage.sections?.clients || [];
      const clients = Array.isArray(clientsMeta) ? clientsMeta : DEFAULT_HOME_STRUCTURE.sections.clients;

      // Build all sections with their sortOrder
      const allSections = {
        hero,
        about,
        features,
        ceo,
        stats,
        ourStory,
        freedom,
        services: servicesSection,
        blog: blogSection,
        clients
      };

      // Add isActive/sortOrder to array-type sections (features, stats, clients)
      if (allSections.features.isActive === undefined) allSections.features.isActive = true;
      if (!allSections.features.sortOrder && allSections.features.sortOrder !== 0) allSections.features.sortOrder = 2;
      if (allSections.stats.isActive === undefined) allSections.stats.isActive = true;
      if (!allSections.stats.sortOrder && allSections.stats.sortOrder !== 0) allSections.stats.sortOrder = 4;
      if (allSections.clients.isActive === undefined) allSections.clients.isActive = true;
      if (!allSections.clients.sortOrder && allSections.clients.sortOrder !== 0) allSections.clients.sortOrder = 9;

      // Filter out inactive sections for public API
      const sectionsToReturn = includeInactive ? allSections : Object.fromEntries(
        Object.entries(allSections).filter(([key, value]) => {
          if (Array.isArray(value)) return value.isActive !== false;
          return value.isActive !== false;
        })
      );

      // Sort sections by sortOrder (for the response we return an ordered object)
      const sortedSectionEntries = Object.entries(sectionsToReturn).sort((a, b) => {
        const aOrder = Array.isArray(a[1]) ? (a[1].sortOrder ?? 99) : (a[1].sortOrder ?? 99);
        const bOrder = Array.isArray(b[1]) ? (b[1].sortOrder ?? 99) : (b[1].sortOrder ?? 99);
        return aOrder - bOrder;
      });

      const sortedSections = Object.fromEntries(sortedSectionEntries);

      return {
        _id: homePage._id,
        pageType: homePage.pageType,
        slug: homePage.slug,
        language: homePage.language,
        isActive: homePage.isActive,
        seo: homePage.seo || DEFAULT_HOME_STRUCTURE.seo,
        sections: sortedSections
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
          const url = buildImageUrl(req, file.filename);

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

    const mergedSections = _.mergeWith(
      {},
      DEFAULT_HOME_STRUCTURE.sections,
      existingSections,
      sections,
      (objValue, srcValue) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
          return srcValue;
        }
      }
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

  // ------------------ UPDATE SECTION ------------------
  static async updateSection(language, sectionKey, data, files, req) {
    console.log('[updateSection] Language:', language, 'Section:', sectionKey);

    let homePage = await PageContent.findOne({ pageType: 'home', language });
    if (!homePage) {
      homePage = await PageContent.create({
        ...DEFAULT_HOME_STRUCTURE,
        pageType: 'home',
        slug: 'home',
        language,
        isActive: true
      });
    }

    const existingSections = homePage.sections?.toObject?.() || homePage.sections || {};
    const sectionData = data.sectionData || {};

    // Parse JSON string if sectionData is a string
    let parsedData = sectionData;
    if (typeof sectionData === 'string') {
      try {
        parsedData = JSON.parse(sectionData);
      } catch (e) {
        console.error('[updateSection] Error parsing sectionData:', e.message);
        parsedData = {};
      }
    }

    // Handle uploaded files
    if (files) {
      const protocol = req.protocol;
      const host = req.get('host');

      for (const [field, fileArr] of Object.entries(files)) {
        if (Array.isArray(fileArr) && fileArr.length > 0) {
          const file = fileArr[0];
          const url = buildImageUrl(req, file.filename);
          const fileObj = {
            url,
            alt: file.originalname || '',
            size: file.size || 0,
            mimeType: file.mimetype || '',
            uploadedAt: new Date()
          };

          // Map field name to section property
          if (field === 'image') {
            parsedData.image = fileObj;
          } else if (field === 'backgroundImage') {
            parsedData.backgroundImage = fileObj;
          } else if (field === 'logo') {
            parsedData.logo = fileObj;
          } else {
            parsedData[field] = fileObj;
          }
        }
      }
    }

    // Handle array fields passed as JSON strings
    for (const [key, value] of Object.entries(parsedData)) {
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          parsedData[key] = JSON.parse(value);
        } catch (e) {
          // Not JSON, keep as string
        }
      }
    }

    // Merge with existing section data
    const existingSection = existingSections[sectionKey];
    let mergedSection;
    if (Array.isArray(existingSection)) {
      if (Array.isArray(parsedData)) {
        mergedSection = parsedData;
      } else {
        mergedSection = [...existingSection];
        if (parsedData.isActive !== undefined) mergedSection.isActive = parsedData.isActive;
        if (parsedData.sortOrder !== undefined) mergedSection.sortOrder = parsedData.sortOrder;
      }
    } else if (typeof existingSection === 'object' && existingSection !== null) {
      mergedSection = { ...existingSection, ...parsedData };
    } else {
      mergedSection = parsedData;
    }

    // Update the section
    const updatedSections = { ...existingSections, [sectionKey]: mergedSection };

    homePage = await PageContent.findByIdAndUpdate(
      homePage._id,
      { $set: { sections: updatedSections, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    console.log('[updateSection] Updated section:', sectionKey);
    return homePage;
  }

  // ------------------ ADD SECTION ------------------
  static async addSection(language, data, files, req) {
    console.log('[addSection] Language:', language);

    let homePage = await PageContent.findOne({ pageType: 'home', language });
    if (!homePage) {
      homePage = await PageContent.create({
        ...DEFAULT_HOME_STRUCTURE,
        pageType: 'home',
        slug: 'home',
        language,
        isActive: true
      });
    }

    const existingSections = homePage.sections?.toObject?.() || homePage.sections || {};
    const sectionData = data.sectionData || {};

    let parsedData = sectionData;
    if (typeof sectionData === 'string') {
      try {
        parsedData = JSON.parse(sectionData);
      } catch (e) {
        console.error('[addSection] Error parsing sectionData:', e.message);
        parsedData = {};
      }
    }

    const sectionKey = parsedData.key || parsedData.sectionKey;
    if (!sectionKey) {
      throw new Error('Section key is required');
    }

    // Remove key/sectionKey from the data before storing
    const { key, sectionKey: sk, ...sectionContent } = parsedData;

    // Handle uploaded files
    if (files) {
      const protocol = req.protocol;
      const host = req.get('host');

      for (const [field, fileArr] of Object.entries(files)) {
        if (Array.isArray(fileArr) && fileArr.length > 0) {
          const file = fileArr[0];
          const url = buildImageUrl(req, file.filename);
          const fileObj = {
            url,
            alt: file.originalname || '',
            size: file.size || 0,
            mimeType: file.mimetype || '',
            uploadedAt: new Date()
          };

          if (field === 'image') {
            sectionContent.image = fileObj;
          } else if (field === 'backgroundImage') {
            sectionContent.backgroundImage = fileObj;
          } else if (field === 'logo') {
            sectionContent.logo = fileObj;
          } else {
            sectionContent[field] = fileObj;
          }
        }
      }
    }

    // Handle array fields passed as JSON strings
    for (const [key, value] of Object.entries(sectionContent)) {
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          sectionContent[key] = JSON.parse(value);
        } catch (e) {
          // Not JSON, keep as string
        }
      }
    }

    // Add the new section
    const updatedSections = { ...existingSections, [sectionKey]: sectionContent };

    homePage = await PageContent.findByIdAndUpdate(
      homePage._id,
      { $set: { sections: updatedSections, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    console.log('[addSection] Added section:', sectionKey);
    return homePage;
  }

  // ------------------ DELETE SECTION ------------------
  static async deleteSection(language, sectionKey) {
    console.log('[deleteSection] Language:', language, 'Section:', sectionKey);

    const homePage = await PageContent.findOne({ pageType: 'home', language });
    if (!homePage) {
      throw new NotFoundError('Home page not found');
    }

    const existingSections = homePage.sections?.toObject?.() || homePage.sections || {};

    // Check if section exists
    if (!(sectionKey in existingSections)) {
      throw new NotFoundError(`Section "${sectionKey}" not found`);
    }

    // Delete the section
    delete existingSections[sectionKey];

    const updatedPage = await PageContent.findByIdAndUpdate(
      homePage._id,
      { $set: { sections: existingSections, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    console.log('[deleteSection] Deleted section:', sectionKey);
    return updatedPage;
  }

  // ------------------ REORDER SECTIONS ------------------
  static async reorderSections(language, sectionKey, direction) {
    console.log('[reorderSections] Language:', language, 'Section:', sectionKey, 'Direction:', direction);

    const homePage = await PageContent.findOne({ pageType: 'home', language });
    if (!homePage) throw new NotFoundError('Home page not found');

    const existingSections = homePage.sections?.toObject?.() || homePage.sections || {};

    // Get all section entries with their sortOrder
    const sectionEntries = Object.entries(existingSections).map(([key, value]) => {
      const sortOrder = Array.isArray(value) ? (value.sortOrder ?? 99) : (value?.sortOrder ?? 99);
      return { key, sortOrder, value };
    });

    // Sort by sortOrder
    sectionEntries.sort((a, b) => a.sortOrder - b.sortOrder);

    // Find current section index
    const currentIndex = sectionEntries.findIndex(entry => entry.key === sectionKey);
    if (currentIndex === -1) throw new NotFoundError(`Section "${sectionKey}" not found`);

    // Determine target index
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sectionEntries.length) {
      throw new Error(`Cannot move section ${direction} — already at the ${direction === 'up' ? 'top' : 'bottom'}`);
    }

    // Swap sortOrder values
    const tempOrder = sectionEntries[currentIndex].sortOrder;
    sectionEntries[currentIndex].sortOrder = sectionEntries[targetIndex].sortOrder;
    sectionEntries[targetIndex].sortOrder = tempOrder;

    // Build updated sections object
    const updatedSections = { ...existingSections };
    for (const entry of sectionEntries) {
      if (Array.isArray(entry.value)) {
        updatedSections[entry.key] = [...entry.value];
        updatedSections[entry.key].sortOrder = entry.sortOrder;
      } else if (typeof entry.value === 'object' && entry.value !== null) {
        updatedSections[entry.key] = { ...entry.value, sortOrder: entry.sortOrder };
      } else {
        updatedSections[entry.key] = entry.value;
      }
    }

    return await PageContent.findByIdAndUpdate(
      homePage._id,
      { $set: { sections: updatedSections, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
  }

  // ------------------ GET PAGE BY TYPE ------------------
  static async getPageByType(pageType, language) {
    const page = await PageContent.findOne({ pageType, language, isActive: true })
      .populate({
        path: 'sections.blog.featuredBlogs',
        model: 'Blog',
        select: 'title subtitle excerpt thumbnail slug featuredImage createdAt'
      })
      .populate({
        path: 'sections.services.featuredServices',
        model: 'Service',
        select: 'title subtitle icon thumbnail slug featuredImage'
      })
      .lean();
    if (!page) throw new NotFoundError('Page not found');
    return page;
  }

  // ------------------ GET PAGE BY ID ------------------
  static async getPageById(id, language) {
    const page = await PageContent.findOne({ _id: id, language, isActive: true })
      .populate({
        path: 'sections.blog.featuredBlogs',
        model: 'Blog',
        select: 'title subtitle excerpt thumbnail slug featuredImage createdAt'
      })
      .populate({
        path: 'sections.services.featuredServices',
        model: 'Service',
        select: 'title subtitle icon thumbnail slug featuredImage'
      })
      .lean();
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
