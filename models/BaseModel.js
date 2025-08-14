const mongoose = require('mongoose');

const baseOptions = {
  discriminatorKey: 'contentType', // For inheritance
  collection: 'content',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const baseSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
      enum: ['en', 'ar'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      canonicalUrl: String,
      ogTitle: String,
      ogDescription: String,
      ogImage: String,
    },
    // Common fields for all content types
    slug: {
      type: String,
      unique: false,
      trim: true,
      lowercase: true,
    },
  },
  baseOptions
);

// Add text index for search
baseSchema.index({
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.metaKeywords': 'text',
});

// Virtual for URL
baseSchema.virtual('url').get(function () {
  return `/${this.language === 'en' ? '' : this.language + '/'}${this.slug}`;
});

// Pre-save hook to generate slug if not provided
baseSchema.pre('save', function (next) {
  if (this.slug && typeof this.slug === 'string') {
    this.slug = this.slug.toLowerCase();
  }
  next();
}); 

module.exports = mongoose.model('Base', baseSchema);
