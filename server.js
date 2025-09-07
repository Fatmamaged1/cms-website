require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
//const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// Import routes
const pageRoutes = require('./routes/pages');
const serviceRoutes = require('./routes/services');
const blogRoutes = require('./routes/blogs');
const careerRoutes = require('./routes/careers');
const contactRoutes = require('./routes/contact');
const aboutRoutes = require('./routes/about');
const clientRoutes = require('./routes/clients');
const partnerRoutes = require('./routes/partners');
const { errorHandler } = require('./utils/errors');
const authRoutes = require("./routes/auth");


// Initialize express app
const app = express();

// Set security HTTP headers
//app.use(helmet());

app.use(cors({
  origin: true, // كل المواقع مسموح لها
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // حددت طرق الطلب
  credentials: true // إذا كنت تستخدم الكوكيز أو التوكن
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution (must come before routes)
//app.use(hpp({
//  whitelist: [
//    'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
//  ]
//}));

// Cookie parser
app.use(cookieParser());

// Compression middleware (should be placed before routes)
app.use(compression());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  });
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(err);
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// API routes
app.use('/api/v1/pages', pageRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/careers', careerRoutes);
app.use('/api/v1/about', aboutRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/partners", partnerRoutes);
app.use("/api/v1/clients", clientRoutes);

// Serve uploads folder statically
// القديم (direct in uploads/)
// القديم (direct in uploads/)
// يدعم القديم
// دعم الصور القديمة مباشرة
// يدعم القديم والجديد
// سيعرض كل الملفات داخل uploads/images مباشرة من جذر السيرفر
app.use(express.static(path.join(__dirname, 'public/uploads/images')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
}


// Handle 404 - Keep this as the last route
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
