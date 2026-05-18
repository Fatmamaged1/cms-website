const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Blog = require('../models/Blog');

const { withCache, clearCache } = require('../services/cache.js');
const { BadRequestError, NotFoundError } = require('../utils/errors.js');
const { handleUpload, handleMultipleUploads, fileService } = require('../services/upload');
const { sendResponse } = require('../utils/response');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const { validateRequest, parseFormDataJson } = require('../middleware/validation');

const router = express.Router();
// ✅ Get all blog posts with only the fields you want
router.get('/', optionalProtect, async (req, res, next) => {
  try {
    const { category, tag, search, language = 'en' } = req.query;

    const query = { language };
    if (!req.user) {
      query.status = "published";
    }

    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const posts = await withCache(
      `blogs:all:${JSON.stringify(query)}`,
      () => Blog.find(query)
        .select('_id language isActive seo slug contentType title subtitle excerpt featuredImage status publishedAt createdAt updatedAt')
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

router.get('/:idOrSlug', optionalProtect, async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const { language = 'en' } = req.query;

    const lookup = isBlogObjectId(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug, language };

    if (!req.user && !isBlogObjectId(idOrSlug)) {
      lookup.status = "published";
    }

    const post = await withCache(
      `blog:${idOrSlug}:${language}`,
      () => Blog.findOneAndUpdate(
        lookup,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate('relatedPosts', 'title slug excerpt thumbnail featuredImage createdAt')
        .populate('author', 'name email')
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

const imageFields = ['featuredImage', 'thumbnail', 'authorImage'];

const hasUploadedFile = (req, field) => Boolean(req.body[field]);

router.post('/', protect, authorize('admin'),
  handleMultipleUploads([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'authorImage', maxCount: 1 }
  ]),
  parseFormDataJson(['categories', 'tags', 'seo']), async (req, res, next) => {

  await Promise.all([
    body('title').trim().notEmpty().withMessage('Title is required').run(req),
    body('excerpt').optional({ nullable: true }).isString().withMessage('Excerpt must be a string').run(req),
    body('content').optional({ nullable: true }).isString().withMessage('Content must be a text').run(req),
    body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status').run(req),
    body('language').isIn(['en', 'ar']).withMessage('Invalid language code').run(req),
    body('categories').optional().isArray().withMessage('Categories must be an array').run(req),
    body('tags').optional().isArray().withMessage('Tags must be an array').run(req)
  ]);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError('Validation failed', 400, errors.array()));
    }

    const postData = {
      ...req.body,
      author: req.user?._id,
      slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
    next(error);
  }
});

// ✅ Update a blog post
router.patch('/:id', protect, authorize('admin'),
  handleMultipleUploads([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'authorImage', maxCount: 1 }
  ]),
  parseFormDataJson(['categories', 'tags', 'seo']), [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('title').optional().trim().notEmpty(),
  body('excerpt').optional().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('language').optional().isIn(['en', 'ar'])
], async (req, res, next) => {
  let oldFeaturedImage = null;
  let oldThumbnail = null;
  let oldAuthorImage = null;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError('Validation failed', 400, errors.array()));
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    const hasNewFiles = imageFields.some(f => hasUploadedFile(req, f));
    if (hasNewFiles) {
      const currentPost = await Blog.findById(id).select('featuredImage thumbnail authorImage');
      if (currentPost) {
        oldFeaturedImage = currentPost.featuredImage;
        oldThumbnail = currentPost.thumbnail;
        oldAuthorImage = currentPost.authorImage;
      }
    }

    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const post = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!post) {
      return next(new NotFoundError('No blog post found with that ID', 404));
    }

    const newImages = [post.featuredImage, post.thumbnail, post.authorImage];
    const oldImages = [oldFeaturedImage, oldThumbnail, oldAuthorImage];
    for (let i = 0; i < oldImages.length; i++) {
      if (oldImages[i] && oldImages[i] !== newImages[i]) {
        try { await fileService.deleteFileByUrl(oldImages[i]); } catch {}
      }
    }

    await clearCache(`blog:${post.slug}`);
    await clearCache('blog:list*');

    sendResponse(res, {
      message: 'Blog post updated successfully',
      data: post
    });
  } catch (error) {
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
