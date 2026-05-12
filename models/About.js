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
  // Optional legacy fields (kept so older docs still validate)
  title: { type: String },
  image: ImageSchema,
  content: {
    blocks: [
      {
        type: { type: String },
        data: { type: Object }
      }
    ]
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

  // Dashboard-driven sections
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

  // CEO / Story extensions used by the website
  ceo: {
    name: String,
    title: String,
    message: String,
    imageDark: String,
    imageLight: String
  },
  story: {
    title: String,
    subtitle: String,
    bullets: [{
      title: String,
      content: String
    }]
  },

  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
