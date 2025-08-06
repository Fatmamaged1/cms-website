const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

// Reuse the block content schema
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

const blogSchema = new mongoose.Schema({
  // Blog post details
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [500, 'Subtitle cannot be more than 500 characters']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [1000, 'Excerpt cannot be more than 1000 characters']
  },
  thumbnail: {
    type: String,
    trim: true
  },
  featuredImage: {
    type: String,
    trim: true
  },
  
  // Main content as blocks
  content: blockContentSchema,
  
 
  
  // Publication status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
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
  
  // Metadata
  readingTime: {
    type: Number, // in minutes
    default: 5
  },
  
  // Related posts
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
}, { 
  discriminatorKey: 'contentType',
  timestamps: true 
});

// Create a compound index for slug and language
blogSchema.index({ slug: 1, language: 1 }, { unique: true });

// Index for status and publishedAt for filtering
blogSchema.index({ status: 1, publishedAt: -1 });

// Text index for search
blogSchema.index({
  title: 'text',
  subtitle: 'text',
  excerpt: 'text',
  'content.blocks.data.text': 'text',
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.metaKeywords': 'text',
  tags: 'text'
});

// Pre-save hook to set publishedAt when status changes to 'published'
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Create the Blog model by extending BaseModel
const Blog = BaseModel.discriminator('Blog', blogSchema);

module.exports = Blog;
