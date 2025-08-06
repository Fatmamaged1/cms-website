const express = require('express');
const router = express.Router();

// Import route files
const pages = require('./pages');
const services = require('./services');
const blogs = require('./blogs');
const careers = require('./careers');
const contact = require('./contact');

// Mount routes
router.use('/pages', pages);
router.use('/services', services);
router.use('/blogs', blogs);
router.use('/careers', careers);
router.use('/contact', contact);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = router;
