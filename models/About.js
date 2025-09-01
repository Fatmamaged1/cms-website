// models/About.js
const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: {
    url: { type: String },
    alt: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    uploadedAt: { type: Date }
  },
  content: {
    blocks: [
      {
        type: { type: String, required: true },
        data: { type: Object, required: true }
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
  }]
,  
  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
