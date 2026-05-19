
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validateRequest, parseFormDataJson } = require('../middleware/validation');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const Service = require('../models/Service');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { handleUpload, handleMultipleUploads, fileService } = require('../services/upload');
const { processContentUploads, cleanupOrphanedFiles } = require('../middleware/contentUpload');
const Partner = require('../models/Partner');

async function addPartnersToService(serviceId, partnerId) {
  try {
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      throw new NotFoundError('Partner not found');
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    // Check if already linked
    if (!service.partners.includes(partnerId)) {
      service.partners.push(partnerId);
      await service.save();
    }
    // Check if already in partner's services
    if (!partner.services.includes(serviceId)) {
      partner.services.push(serviceId);
      await partner.save();
    }
    return service;
  } catch (error) {
    console.error('Error adding partner to service:', error);
    return null;
  }
}

async function removePartnerFromService(serviceId, partnerId) {
  try {
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      throw new NotFoundError('Partner not found');
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    // Remove partner from service's partners array
    service.partners = service.partners.filter(p => p.toString() !== partnerId);
    await service.save();
    // Remove service from partner's services array
    partner.services = partner.services.filter(s => s.toString() !== serviceId);
    await partner.save();
    return service;
  } catch (error) {
    console.error('Error removing partner from service:', error);
    return null;
  }
}

// Middleware to set language
const setLanguage = (req, res, next) => {
  req.language = req.query.lang || req.acceptsLanguages(['en', 'ar']) || 'en';
  next();
};

// Get all services (with pagination and filtering)
router.get(
  '/',
  [
    optionalProtect,
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

    const query = { language };
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

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
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('partners', 'name logo brief url slug')
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


// Get service by id OR slug (admin sends ObjectId from the dashboard,
// public site sends slug). Crashing on the lookup used to take the
// Node worker down and cascade 502s across the whole API.
const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);

router.get(
  '/:idOrSlug',
  [
    param('idOrSlug').isString().trim().notEmpty(),
    setLanguage
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { idOrSlug } = req.params;
      const { language } = req;

      const lookup = isObjectId(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: idOrSlug, language, isActive: true };

      const service = await Service.findOne(lookup)
        .populate('relatedServices', 'title slug excerpt thumbnail')
        .populate('partners', 'name logo brief url slug')
        .lean();

      if (!service) {
        throw new NotFoundError('Service not found');
      }

      // Increment view count in background, only if we have a real doc
      Service.findByIdAndUpdate(service._id, { $inc: { views: 1 } })
        .catch((err) => console.error('view count update failed', err));

      res.json({
        status: 'success',
        message: 'Service retrieved successfully',
        data: service
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create a new service (admin only)
router.post(
    '/',
    protect,
    authorize('admin'),
    handleMultipleUploads([
      { name: 'featuredImage', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
  parseFormDataJson(['categories', 'tags', 'seo', 'featured', 'isActive', 'features', 'offerings', 'steps', 'faq']),
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('description').optional().isString().withMessage('Description is required'),
      body('content').optional().isString().withMessage('Content is required'),
      body('categories').optional().isArray().withMessage('Categories must be an array'),
      body('tags').optional().isArray().withMessage('Tags must be an array'),
      body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
      body('seo').optional().isObject().withMessage('SEO must be an object'),
      setLanguage
    ],
    validateRequest,
    async (req, res, next) => {
      try {
        const userId = req.user?.id; // إذا كنت تحتاج ربط الخدمة بالمستخدم
        
        // ✅ معالجة البيانات القادمة كسلاسل JSON (لأنها من form-data)
        const parsedCategories = Array.isArray(req.body.categories) ? req.body.categories : (req.body.categories ? JSON.parse(req.body.categories) : []);
        const parsedTags = Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? JSON.parse(req.body.tags) : []);
        const parsedSeo = typeof req.body.seo === 'object' ? req.body.seo : (req.body.seo ? JSON.parse(req.body.seo) : null);
        const parsedFeatures = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : (req.body.features || []);
        const parsedOfferings = typeof req.body.offerings === 'string' ? JSON.parse(req.body.offerings) : (req.body.offerings || []);
        const parsedSteps = typeof req.body.steps === 'string' ? JSON.parse(req.body.steps) : (req.body.steps || []);
        const parsedFaq = typeof req.body.faq === 'string' ? JSON.parse(req.body.faq) : (req.body.faq || []);
        const serviceData = {
          title: req.body.title,
          description: req.body.description,
          slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          content: req.body.content,
          categories: parsedCategories,
          tags: parsedTags,
          seo: parsedSeo,
          featured: req.body.featured === 'true' || req.body.featured === true,
          features: parsedFeatures,
          offerings: parsedOfferings,
          steps: parsedSteps,
          faq: parsedFaq,
          featuredImage: Array.isArray(req.body.featuredImage) ? req.body.featuredImage[0] : (req.body.featuredImage || null),
          thumbnail: Array.isArray(req.body.thumbnail) ? req.body.thumbnail[0] : (req.body.thumbnail || null),
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
        const allFiles = req.files ? Object.values(req.files).flat() : (req.file ? [req.file] : []);
        for (const f of allFiles) {
          await fileService.deleteFileByUrl(f.filename).catch(() => {});
        }
        next(error);
      }
    }
  );
  
// Update a service (admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  handleMultipleUploads([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  processContentUploads, // Process any file uploads in content blocks
  parseFormDataJson(['categories', 'tags', 'seo', 'featured', 'isActive']),
  [
    param('id').isMongoId().withMessage('Invalid service ID'),
    body('title').optional().isString().trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description is required'),
    body('content').optional().isString().withMessage('Content is required'),
    body('categories').optional().isArray().withMessage('Categories must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
    body('seo').optional().isObject().withMessage('SEO must be an object'),
    body('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
    body('isActive').optional().isBoolean().withMessage('Active status must be a boolean')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Parse JSON string fields that come from multipart/form-data
      // (parseFormDataJson may not have run yet if multer is still processing)
      ['faq', 'features', 'offerings', 'steps'].forEach((field) => {
        if (typeof updateData[field] === 'string') {
          try {
            updateData[field] = JSON.parse(updateData[field]);
          } catch (e) {
            delete updateData[field];
          }
        }
      });

      // Parse boolean fields from strings
      if (typeof updateData.featured === 'string') updateData.featured = updateData.featured === 'true';
      if (typeof updateData.isActive === 'string') updateData.isActive = updateData.isActive === 'true';
      
      // Get the existing service to handle image cleanup if needed
      const existingService = await Service.findById(id);
      if (!existingService) {
        console.log('Service not found 2');
        throw new NotFoundError('Service not found');
      }
      
      let oldImageUrl = existingService.featuredImage;
      let oldThumbnailUrl = existingService.thumbnail;
      
      // Handle uploaded files — handleMultipleUploads puts URLs as arrays in req.body
      if (Array.isArray(req.body.featuredImage)) {
        updateData.featuredImage = req.body.featuredImage[0];
      }
      if (Array.isArray(req.body.thumbnail)) {
        updateData.thumbnail = req.body.thumbnail[0];
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
      
      // Clean up old images if they were replaced
      if (oldImageUrl && oldImageUrl !== service.featuredImage) {
        await fileService.deleteFileByUrl(oldImageUrl);
      }
      if (oldThumbnailUrl && oldThumbnailUrl !== service.thumbnail) {
        await fileService.deleteFileByUrl(oldThumbnailUrl);
      }
      
      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      // Clean up uploaded files if there's an error
      const allFiles = req.files ? Object.values(req.files).flat() : (req.file ? [req.file] : []);
      for (const f of allFiles) {
        await fileService.deleteFileByUrl(f.filename).catch(() => {});
      }
      next(error);
    }
  }
);
router.post(
    '/:serviceId/partners/:partnerId',
    protect,
    authorize('admin'),
    async (req, res, next) => {
      try {
        const { serviceId, partnerId } = req.params;
        const service = await addPartnersToService(serviceId, partnerId);
        if (!service) {
          throw new NotFoundError('Service not found');
        }
        res.json({
          success: true,
          data: service
        });
      } catch (error) {
        next(error);
      }
    }
  );

router.delete(
  '/:serviceId/partners/:partnerId',
  protect,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { serviceId, partnerId } = req.params;
      const service = await removePartnerFromService(serviceId, partnerId);
      if (!service) {
        throw new NotFoundError('Service not found');
      }
      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a service (admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
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
        console.log('Service not found 3');
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

// ===== FAQ Routes =====

// Add FAQ to a service
router.post(
  '/faq/:serviceId',
  protect,
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { serviceId } = req.params;
      const { question, answer } = req.body;

      const service = await Service.findById(serviceId);
      if (!service) {
        throw new NotFoundError('Service not found');
      }

      service.faq = service.faq || [];
      service.faq.push({ question, answer, order: service.faq.length });
      await service.save();

      res.status(201).json({
        success: true,
        message: 'FAQ added successfully',
        data: service.faq
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update FAQ item
router.put(
  '/faq/:serviceId/:faqId',
  protect,
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    param('faqId').isMongoId().withMessage('Invalid FAQ ID'),
    body('question').optional().trim().notEmpty().withMessage('Question is required'),
    body('answer').optional().trim().notEmpty().withMessage('Answer is required')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { serviceId, faqId } = req.params;
      const { question, answer } = req.body;

      const service = await Service.findById(serviceId);
      if (!service) {
        throw new NotFoundError('Service not found');
      }

      const faqItem = service.faq.id(faqId);
      if (!faqItem) {
        throw new NotFoundError('FAQ item not found');
      }

      if (question !== undefined) faqItem.question = question;
      if (answer !== undefined) faqItem.answer = answer;
      await service.save();

      res.json({
        success: true,
        message: 'FAQ updated successfully',
        data: faqItem
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete FAQ item
router.delete(
  '/faq/:serviceId/:faqId',
  protect,
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    param('faqId').isMongoId().withMessage('Invalid FAQ ID')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { serviceId, faqId } = req.params;

      const service = await Service.findById(serviceId);
      if (!service) {
        throw new NotFoundError('Service not found');
      }

      const faqItem = service.faq.id(faqId);
      if (!faqItem) {
        throw new NotFoundError('FAQ item not found');
      }

      faqItem.remove();
      await service.save();

      res.json({
        success: true,
        message: 'FAQ deleted successfully',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all partners linked to a service
router.get(
  '/:serviceId/partners',
  async (req, res, next) => {
    try {
      const { serviceId } = req.params;

      const service = await Service.findById(serviceId).populate('partners', 'name logo brief url slug').lean();
      if (!service) {
        throw new NotFoundError('Service not found');
      }

      res.json({
        success: true,
        data: service.partners || []
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
