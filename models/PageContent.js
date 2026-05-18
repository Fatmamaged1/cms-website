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
  sections: { type: mongoose.Schema.Types.Mixed },
  
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
