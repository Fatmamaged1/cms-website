require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

// ===== Import routes =====
const pageRoutes = require('./routes/pages');
const serviceRoutes = require('./routes/services');
const blogRoutes = require('./routes/blogs');
const careerRoutes = require('./routes/careers');
const contactRoutes = require('./routes/contact');
const aboutRoutes = require('./routes/about');
const clientRoutes = require('./routes/clients');
const partnerRoutes = require('./routes/partners');
const authRoutes = require("./routes/auth");
const testimonialRoutes = require('./routes/testimonials');
const termsRoutes = require('./routes/termsConditions');
const privacyRoutes = require('./routes/privacyPolicy');
const { errorHandler } = require('./utils/errors');

const app = express();

// ===== CORS =====
const cors = require('cors');
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// ===== Security Headers (Helmet) =====
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ===== Rate Limiting =====
const rateLimit = require('express-rate-limit');
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { 
    status: 'error', 
    message: 'Too many requests, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login attempts per hour
  message: { 
    status: 'error', 
    message: 'Too many login attempts, please try again later.' 
  },
});
app.use('/api/v1/auth/login', authLimiter);

// ===== HTTP Parameter Pollution Protection =====
const hpp = require('hpp');
app.use(hpp());

// ===== Logging =====
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ===== Body Parser =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ===== Security Middleware =====
app.use(mongoSanitize()); // NoSQL injection
app.use(xss());           // XSS
app.use(cookieParser());
app.use(compression());

// ===== Database Connection =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ===== API Routes =====
app.use('/api/v1/pages', pageRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/careers', careerRoutes);
app.use('/api/v1/about', aboutRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);
app.use('/api/v1/terms-conditions', termsRoutes);
app.use('/api/v1/privacy-policy', privacyRoutes);

// ===== Static Files =====
app.use(express.static(path.join(__dirname,'public/uploads/images')));
app.use(express.static(path.join(__dirname,'public/uploads/files')));
app.use('/uploads/images', express.static(path.join(__dirname,'public/uploads/images')));
app.use('/uploads/files', express.static(path.join(__dirname,'public/uploads/files')));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname,'../client/build')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname,'..','client','build','index.html')));
}

// ===== 404 Handler =====
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// ===== Global Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// ===== Handle Unhandled Rejections =====
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => console.log('💥 Process terminated!'));
});

// ===== Newsletter Cron =====
require('./newsletterCron');
