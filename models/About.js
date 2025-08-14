// models/About.js
const mongoose = require('mongoose');
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
    content: blockContentSchema,
    image: String,
    video: String,
    order: { type: Number, default: 0 }
  }]
,  
  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
