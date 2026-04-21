const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  icon: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
