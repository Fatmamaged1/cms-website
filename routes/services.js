
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const Service = require('../models/Service');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { handleUpload, fileService } = require('../services/upload');
const { processContentUploads, cleanupOrphanedFiles } = require('../middleware/contentUpload');

// Middleware to set language
const setLanguage = (req, res, next) => {
  req.language = req.query.lang || req.acceptsLanguages(['en', 'ar']) || 'en';
  next();
};

// Get all services (with pagination and filtering)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('featured').optional().isBoolean().toBoolean(),
    query('category').optional().isMongoId(),
    query('tag').optional().isString().trim(),
    query('search').optional().isString().trim(),
    setLanguage
  ],
  validateRequest,
  async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      featured, 
      category, 
      tag,
      search 
    } = req.query;
    const { language } = req;

    const query = { 
      language,
      isActive: true 
    };

    if (featured !== undefined) {
      query.featured = featured;
    }

    if (category) {
      query.categories = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find(query)
        .select('contentType title featuredImage content') // ✅ Only return these fields
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      message: 'Services retrieved successfully',
      data: services,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
  }
);


// Get service by slug
router.get(
  '/:slug',
  [
    param('slug').isString().trim().notEmpty(),
    setLanguage
  ],
  validateRequest,
  async (req, res) => {
    const { slug } = req.params;
    const { language } = req;

    const service = await Service.findOne({
      slug,
      language,
      isActive: true
    })
   // .populate('categories', 'name slug')
    .populate('relatedServices', 'title slug excerpt thumbnail')
    .lean();

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Increment view count (in background)
    Service.findByIdAndUpdate(service._id, { $inc: { views: 1 } }).exec();

    res.json({
      status: 'success',
      message: 'Service retrieved successfully',
      data: service
    });
  }
);

// Create a new service (admin only)
router.post(
    '/',
    handleUpload('featuredImage'), // رفع صورة مميزة
    processContentUploads, // معالجة ملفات داخل content
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('description').optional().isString(),
      body('content').optional(),
      body('categories').optional(),
      body('tags').optional(),
      body('featured').optional().isBoolean(),
      body('seo').optional(),
      setLanguage
    ],
    validateRequest,
    async (req, res, next) => {
      try {
        const userId = req.user?.id; // إذا كنت تحتاج ربط الخدمة بالمستخدم
        
        // ✅ معالجة البيانات القادمة كسلاسل JSON (لأنها من form-data)
        const parsedContent = req.body.content ? JSON.parse(req.body.content) : null;
        const parsedCategories = req.body.categories ? JSON.parse(req.body.categories) : [];
        const parsedTags = req.body.tags ? JSON.parse(req.body.tags) : [];
        const parsedSeo = req.body.seo ? JSON.parse(req.body.seo) : null;
  
        const serviceData = {
          title: req.body.title,
          description: req.body.description,
          slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          content: parsedContent,
          categories: parsedCategories,
          tags: parsedTags,
          seo: parsedSeo,
          featured: req.body.featured === 'true' || req.body.featured === true,
          featuredImage: req.file
          ? `${req.protocol}://${req.get('host')}/${req.file.filename.replace(/\\/g, '/').replace('public/', '')}`
          : null,
          language: req.language,
          createdBy: userId,
        };
  
        const service = await Service.create(serviceData);
  
        res.status(201).json({
          success: true,
          data: service
        });
      } catch (error) {
        // حذف الصورة إذا حصل خطأ
        if (req.file) {
          await fileService.deleteFileByUrl(req.file.path);
        }
        next(error);
      }
    }
  );
  
// Update a service (admin only)
router.put(
  '/:id',
  handleUpload('featuredImage'), // Handle featured image upload
  processContentUploads, // Process any file uploads in content blocks
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('content').optional().isObject(),
    body('categories').optional().isArray(),
    body('tags').optional().isArray(),
    body('featured').optional().isBoolean(),
    body('seo').optional().isObject(),
    body('language').optional().isIn(['en', 'ar']),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Get the existing service to handle image cleanup if needed
      const existingService = await Service.findById(id);
      if (!existingService) {
        throw new NotFoundError('Service not found');
      }
      
      let oldImageUrl = existingService.featuredImage;
      
      // If a new image is being uploaded
      if (req.file) {
        updateData.featuredImage = req.protocol + '://' + req.get('host') + '/' + req.file.path;
      }
      
      // Don't allow changing the slug directly
      if (updateData.slug) {
        delete updateData.slug;
      }
      
      // If updating the title, generate a new slug
      if (updateData.title) {
        updateData.slug = updateData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      const service = await Service.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      // Clean up old image if it was replaced
      if (oldImageUrl && oldImageUrl !== service.featuredImage) {
        await fileService.deleteFileByUrl(oldImageUrl);
      }
      
      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      // Clean up uploaded files if there's an error
      if (req.file) {
        await fileService.deleteFileByUrl(req.body.featuredImage);
      }
      next(error);
    }
  }
);

// Delete a service (admin only)
router.delete(
  '/:id',
  [
    param('id').isMongoId()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      // In a real app, check for admin permissions
      // if (!req.user || !req.user.isAdmin) {
      //   throw new UnauthorizedError('Not authorized to perform this action');
      // }

      const { id } = req.params;
      
      // Find the service first to get the featured image URL
      const service = await Service.findById(id);
      
      if (!service) {
        throw new NotFoundError('Service not found');
      }
      
      // Delete the featured image if it exists
      if (service.featuredImage) {
        await fileService.deleteFileByUrl(service.featuredImage);
      }
      
      // Use soft delete by setting isActive to false
      await Service.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      res.status(204).json({
        success: true,
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
