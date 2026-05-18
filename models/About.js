// models/About.js
const mongoose = require('mongoose');

const ImageSchema = {
  url: { type: String },
  alt: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  uploadedAt: { type: Date }
};

const AboutSchema = new mongoose.Schema({
  // Main About section
  title: { type: String },
  description: { type: String },
  image: ImageSchema,
  content: {
    blocks: [{
      type: { type: String },
      data: { type: Object }
    }]
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },

  // Features / Cards
  features: [{
    title: String,
    subtitle: String,
    icon: String,
    content: String,
    image: String,
    video: String,
    order: { type: Number, default: 0 }
  }],
  features_isActive: { type: Boolean, default: true },
  features_sortOrder: { type: Number, default: 2 },

  // CEO section
  ceo: {
    name: String,
    title: String,
    role: String,
    quote: String,
    message: String,
    image: ImageSchema,
    imageDark: String,
    imageLight: String
  },
  ceo_isActive: { type: Boolean, default: true },
  ceo_sortOrder: { type: Number, default: 1 },

  // Our Story section
  ourStory: {
    title: String,
    subtitle: String,
    description: String,
    howWeGrew: {
      title: String,
      bullets: [String]
    },
    image: {
      light: ImageSchema,
      dark: ImageSchema
    }
  },
  ourStory_isActive: { type: Boolean, default: true },
  ourStory_sortOrder: { type: Number, default: 3 },

  // Legacy dashboard-driven sections
  proud: {
    title: String,
    description: String,
    features: [{
      title: String,
      subtitle: String,
      order: { type: Number, default: 0 }
    }]
  },
  proudImage: ImageSchema,
  mission: {
    title: String,
    description: String
  },
  missionImage: ImageSchema,
  vision: {
    title: String,
    description: String
  },
  visionImage: ImageSchema,
  stats: [{
    num: Number,
    title: String
  }],

  story: {
    title: String,
    subtitle: String,
    bullets: [{
      title: String,
      content: String
    }]
  },

  language: { type: String, default: 'en' },
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
