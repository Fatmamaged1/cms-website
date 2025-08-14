const multer = require('multer');
const path = require('path');
const fs = require('fs');
//const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'public/uploads');
const imageDir = path.join(uploadDir, 'images');
const fileDir = path.join(uploadDir, 'files');

[uploadDir, imageDir, fileDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for documents
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents and images are allowed.'), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, imageDir);
    } else {
      cb(null, fileDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Upload configurations
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to handle file uploads
const handleUpload = (fieldName = 'image', type = 'image') => {
    return (req, res, next) => {
      const upload = type === 'image' ? uploadImage.single(fieldName) : uploadFile.single(fieldName);
      
      upload(req, res, (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
  
        if (req.file) {
          const filePath = req.file.path.replace(/\\/g, '/').replace('public', '');
          req.body[fieldName] = `${process.env.BASE_URL || 'http://localhost:3000'}${filePath}`;
        }
  
        next();
      });
    };
  };
  

// Multiple files upload
// Multiple files upload with multiple field names
const handleMultipleUploads = (fieldsArray, type = 'image') => {
  const upload = type === 'image'
    ? uploadImage.fields(fieldsArray)
    : uploadFile.fields(fieldsArray);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If files were uploaded, map them into body
      if (req.files) {
        for (const field in req.files) {
          req.body[field] = req.files[field].map(file => {
            const filePath = file.path.replace(/\\/g, '/').replace('public', '');
            return `${process.env.BASE_URL || 'http://localhost:3000'}${filePath}`;
          });
        }
      }

      next();
    });
  };
};


module.exports = {
  uploadImage,
  uploadFile,
  handleUpload,
  handleMultipleUploads
};
