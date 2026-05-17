const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Blog = require('../models/Blog');

const { withCache, clearCache } = require('../services/cache.js');
const { BadRequestError, NotFoundError } = require('../utils/errors.js');
const { handleUpload, fileService } = require('../services/upload');
const { sendResponse } = require('../utils/response');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest, parseFormDataJson } = require('../middleware/validation');

const router = express.Router();
// ✅ Get all blog posts with only the fields you want
router.get('/', async (req, res, next) => {
  try {
    const { category, tag, search, language = 'en' } = req.query;

    const query = { language };

    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const posts = await withCache(
      `blogs:all:${JSON.stringify(query)}`,
      () => Blog.find(query)
        .select('_id language isActive seo slug contentType title subtitle excerpt featuredImage status publishedAt createdAt updatedAt')
        .populate('categories')
        .sort({ createdAt: -1 })
        .lean(),
      3600
    );

    sendResponse(res, {
      message: 'All blog posts fetched successfully',
      data: { posts, total: posts.length }
    });
  } catch (error) {
    next(error);
  }
});


// ✅ Get a single blog post by id OR slug
// Admin dashboard passes Mongo ObjectId; public site passes slug.
const isBlogObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);

router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const { language = 'en' } = req.query;

    const lookup = isBlogObjectId(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug, language };

    const post = await withCache(
      `blog:${idOrSlug}:${language}`,
      () => Blog.findOneAndUpdate(
        lookup,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate('categories')
        .populate('relatedPosts', 'title slug excerpt thumbnail featuredImage createdAt')
        .populate('author', 'name avatar')
        .lean(),
      3600
    );

    if (!post) return next(new NotFoundError('No blog post found', 404));

    sendResponse(res, {
      message: 'Blog post retrieved successfully',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, authorize('admin'), handleUpload('featuredImage'), async (req, res, next) => {
  // Parse JSON fields (but NOT content - it stays as a string for the Blog model)
  ['categories', 'tags'].forEach((field) => {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        console.warn(`Invalid JSON in ${field}:`, e.message);
        req.body[field] = null;
      }
    }
  });

  await Promise.all([
    body('title').trim().notEmpty().withMessage('Title is required').run(req),
    body('excerpt').trim().notEmpty().withMessage('Excerpt is required').run(req),
    body('content').optional({ nullable: true }).isString().withMessage('Content must be a text').run(req),
    body('status').isIn(['draft', 'published']).withMessage('Invalid status').run(req),
    body('language').isIn(['en', 'ar']).withMessage('Invalid language code').run(req),
    body('categories').optional().isArray().withMessage('Categories must be an array').run(req),
    body('tags').optional().isArray().withMessage('Tags must be an array').run(req)
  ]);
  

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await fileService.deleteFileByUrl(req.file.filename);
      return next(new BadRequestError('Validation failed', 400, errors.array()));
    }

    const postData = {
      ...req.body,
      author: req.user?._id,
      slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      featuredImage: req.file ? `${req.protocol}://${req.get('host')}/${req.file.filename}` : null
    };

    const post = await Blog.create(postData);
    await clearCache(`blog:${post.slug}`);
    await clearCache('blog:list*');

    sendResponse(res, {
      statusCode: 201,
      message: 'Blog post created successfully',
      data: post
    });
  } catch (error) {
    if (req.file) await fileService.deleteFileByUrl(req.file.filename);
    next(error);
  }
});

// ✅ Update a blog post
router.patch('/:id', protect, authorize('admin'), handleUpload('featuredImage'), parseFormDataJson(['categories', 'tags', 'seo']), [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('title').optional().trim().notEmpty(),
  body('excerpt').optional().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'published']),
  body('language').optional().isIn(['en', 'ar'])
], async (req, res, next) => {
  let oldImageUrl = null;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await fileService.deleteFileByUrl(req.file.filename);
      return next(new BadRequestError('Validation failed', 400, errors.array()));
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      const currentPost = await Blog.findById(id).select('featuredImage');
      if (currentPost?.featuredImage) oldImageUrl = currentPost.featuredImage;
      updateData.featuredImage = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
    }

    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const post = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!post) {
      if (req.file) await fileService.deleteFileByUrl(req.file.filename);
      return next(new NotFoundError('No blog post found with that ID', 404));
    }

    if (oldImageUrl && oldImageUrl !== post.featuredImage) {
      await fileService.deleteFileByUrl(oldImageUrl);
    }

    await clearCache(`blog:${post.slug}`);
    await clearCache('blog:list*');

    sendResponse(res, {
      message: 'Blog post updated successfully',
      data: post
    });
  } catch (error) {
    if (req.file) await fileService.deleteFileByUrl(req.file.filename);
    next(error);
  }
});

// ✅ Delete a blog post
router.delete('/:id', protect, authorize('admin'),
  [param('id').isMongoId().withMessage('Invalid post ID')],
  validateRequest,
  async (req, res, next) => {

  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return next(new NotFoundError('No blog post found with that ID', 404));
    }

    // احذف الصورة
    if (post.featuredImage) {
      try {
        await fileService.deleteFileByUrl(post.featuredImage);
      } catch (e) {
        console.error("Failed to delete image:", e);
      }
    }

    // احذف البوست
    await Blog.findByIdAndDelete(req.params.id);

    // امسح الكاش
    await clearCache(`blog:${post.slug}`);
    await clearCache('blog:list:*');

    return sendResponse(res, {
      message: 'Blog post deleted successfully',
      data: null
    });

  } catch (error) {
    next(error);
  }
});


module.exports = router;
