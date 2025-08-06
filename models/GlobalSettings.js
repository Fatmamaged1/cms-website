const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
  // Site information
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
    maxlength: [100, 'Site name cannot be more than 100 characters']
  },
  siteTagline: {
    type: String,
    trim: true,
    maxlength: [200, 'Tagline cannot be more than 200 characters']
  },
  
  // Logo and favicon
  logo: {
    light: String,  // URL to light version of the logo
    dark: String,   // URL to dark version of the logo
    icon: String,   // URL to favicon
    altText: String // Alt text for accessibility
  },
  
  // Contact information
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    workingHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      isOpen: Boolean,
      openTime: String,  // Format: '09:00'
      closeTime: String, // Format: '17:00'
      is24Hours: Boolean
    }]
  },
  
  // Social media links
  socialMedia: [{
    platform: {
      type: String,
      enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github', 'tiktok', 'pinterest', 'other']
    },
    url: String,
    username: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // SEO settings
  seo: {
    defaultMetaTitle: String,
    defaultMetaDescription: String,
    defaultMetaKeywords: [String],
    metaImage: String,
    metaRobots: String,
    canonicalUrl: String,
    structuredData: mongoose.Schema.Types.Mixed,
    googleAnalyticsId: String,
    googleTagManagerId: String,
    facebookPixelId: String,
    twitterHandle: String
  },
  
  // Email settings
  email: {
    fromName: String,
    fromEmail: String,
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      password: String
    },
    templates: mongoose.Schema.Types.Mixed
  },
  
  // Localization settings
  localization: {
    defaultLanguage: {
      type: String,
      default: 'en',
      enum: ['en', 'ar']
    },
    availableLanguages: [{
      code: {
        type: String,
        enum: ['en', 'ar']
      },
      name: String,
      isDefault: Boolean,
      isActive: Boolean
    }],
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      default: 'HH:mm'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    rtlLanguages: [{
      type: String,
      enum: ['ar']
    }]
  },
  
  // Maintenance mode
  maintenance: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    message: String,
    allowedIps: [String]
  },
  
  // Cache settings
  cache: {
    enabled: {
      type: Boolean,
      default: true
    },
    ttl: {
      type: Number, // in seconds
      default: 3600 // 1 hour
    }
  },
  
  // Custom fields for additional settings
  custom: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Create a method to get settings with caching
const CACHE_KEY = 'global_settings';

globalSettingsSchema.statics.getSettings = async function() {
  // In a real implementation, you would check cache first
  // For now, we'll just return the first settings document
  let settings = await this.findOne({});
  
  // If no settings exist, create default settings
  if (!settings) {
    settings = await this.create({
      siteName: 'My CMS Website',
      siteTagline: 'A modern website built with Node.js and MongoDB',
      'localization.availableLanguages': [
        { code: 'en', name: 'English', isDefault: true, isActive: true },
        { code: 'ar', name: 'العربية', isDefault: false, isActive: true }
      ]
    });
  }
  
  return settings;
};

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);

module.exports = GlobalSettings;
