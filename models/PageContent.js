const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

// Page content schema
const pageContentSchema = new mongoose.Schema({
  // Page identifier (home, about, contact, etc.)
  pageType: {
    type: String,
    required: true,
    enum: ['home', 'about', 'services', 'blog', 'careers', 'contact','privacy-policy','terms-conditions','faq'],
    index: true
  },
  
  // Page sections (dynamic based on pageType)
  sections: {
    hero: {
      title: String,
      subtitle: String,
      // Mixed to support both string URL and object { url, alt, size, mimeType, uploadedAt }
      backgroundImage: { type: mongoose.Schema.Types.Mixed },
      ctaText: String,
      ctaLink: String
    },
    about: {
      title: String,
      subtitle: String,
      description: String,
      content: String,
      // Inline features (the dashboard sends [{ title, content }, ...]).
      // Kept as Mixed so we don't require a separate Feature collection.
      features: { type: mongoose.Schema.Types.Mixed, default: [] },
      // Mixed to support both string URL and object { url, alt, size, mimeType, uploadedAt }
      image: { type: mongoose.Schema.Types.Mixed },
      mainImage: String,
      secondaryImage: String
    },
   
    features: [{
      title: String,
      subtitle: String,
      icon: String,
      content: String,
      image: String,
      video: String,
      order: { type: Number, default: 0 }
    }],
    services: {
      title: String,
      subtitle: String,
      image: String,
      // References to Service model
      featuredServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      }]
    },
    blog: {
      title: String,
      subtitle: String,
      featuredBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
      }]
    },
    clients: [{
      name: String,
      logo: String,
    }],
  },
  
  // Full page content (as blocks)
  content: String,
  
  // SEO specific to this page
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    structuredData: mongoose.Schema.Types.Mixed
  }
}, { discriminatorKey: 'contentType' });

// Create a compound index for pageType and language
pageContentSchema.index({ pageType: 1, language: 1 }, { unique: true });

// Create the PageContent model by extending BaseModel
const PageContent = BaseModel.discriminator('PageContent', pageContentSchema);

module.exports = PageContent;
