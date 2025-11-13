require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
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
const { errorHandler } = require('./utils/errors');

const app = express();

// ===== CORS configuration =====
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://46.202.134.87:2222"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Postman أو server-to-server
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS policy: هذا الدومين غير مسموح"));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-access-token"]
}));


// Handle preflight requests
app.options("*", cors());

// ===== Logging =====
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ===== Rate Limiting =====
const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

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

// ===== Static Files =====
app.use(express.static(path.join(__dirname,'public/uploads/images')));
app.use(express.static(path.join(__dirname,'public/uploads/files')));
app.use('/uploads/images', express.static(path.join(__dirname,'public/uploads/images')));
app.use('/uploads/files', express.static(path.join(__dirname,'public/uploads/files')));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname,'../client/build')));
  app.get('*',(req,res)=>res.sendFile(path.resolve(__dirname,'..','client','build','index.html')));
}

// ===== 404 Handler =====
app.all('*',(req,res)=>{
  res.status(404).json({
    status:'fail',
    message:`Can't find ${req.originalUrl} on this server!`
  });
});

// ===== Global Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT,()=>{
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// ===== Handle Unhandled Rejections =====
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(()=>process.exit(1));
});

process.on('SIGTERM', ()=>{
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(()=>console.log('💥 Process terminated!'));
});

// ===== Newsletter Cron =====
require('./newsletterCron');
