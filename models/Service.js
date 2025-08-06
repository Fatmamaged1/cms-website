const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

// Define the block content schema (same as in PageContent)
const blockContentSchema = new mongoose.Schema({
  time: { type: Number, default: Date.now },
  version: { type: String, default: '2.27.0' },
  blocks: [{
    type: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    id: String,
    tunes: mongoose.Schema.Types.Mixed
  }]
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  // Service details
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [500, 'Subtitle cannot be more than 500 characters']
  },
  icon: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  featuredImage: {
    type: String,
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [1000, 'Excerpt cannot be more than 1000 characters']
  },
  
  // Main content as blocks
  content: blockContentSchema,
  
  // Additional fields
  order: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Categories and tags
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Related services
  relatedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }]
}, { discriminatorKey: 'contentType' });

// Create a compound index for slug and language
serviceSchema.index({ slug: 1, language: 1 }, { unique: true });

// Text index for search
serviceSchema.index({
  title: 'text',
  subtitle: 'text',
  excerpt: 'text',
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.metaKeywords': 'text',
  tags: 'text'
});

// Create the Service model by extending BaseModel
const Service = BaseModel.discriminator('Service', serviceSchema);

module.exports = Service;
