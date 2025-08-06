# File Upload Service Documentation

This document provides a comprehensive guide to using the file upload service in the CMS application.

## Table of Contents
- [Overview](#overview)
- [Installation & Setup](#installation--setup)
- [Uploading Files](#uploading-files)
  - [Single File Upload](#single-file-upload)
  - [Multiple File Uploads](#multiple-file-uploads)
- [Handling Uploads in Routes](#handling-uploads-in-routes)
- [File Service Methods](#file-service-methods)
- [Content Block Uploads](#content-block-uploads)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)

## Overview
The file upload service provides a flexible way to handle file uploads in your CMS application. It supports:
- Single and multiple file uploads
- Image-specific handling with validation
- Automatic file cleanup
- Integration with MongoDB models
- Support for rich text editor content blocks

## Installation & Setup

The file upload service is already set up in your project. It uses the following dependencies:
- `multer` for handling multipart/form-data
- `uuid` for generating unique filenames
- `fs` for file system operations

## Uploading Files

### Single File Upload

To handle a single file upload (e.g., featured image for a blog post):

```javascript
const { handleUpload } = require('../services/upload');

// In your route
router.post('/upload', handleUpload('image'), async (req, res, next) => {
  try {
    // The uploaded file URL is available in req.body.image
    res.json({
      success: true,
      data: {
        imageUrl: req.body.image
      }
    });
  } catch (error) {
    next(error);
  }
});
```

### Multiple File Uploads

To handle multiple file uploads:

```javascript
const { handleMultipleUploads } = require('../services/upload');

// In your route
router.post('/upload-multiple', 
  handleMultipleUploads('images', 5), // 'images' is the field name, 5 is max files
  async (req, res, next) => {
    try {
      // The uploaded file URLs are available in req.body.images (array)
      res.json({
        success: true,
        data: {
          imageUrls: req.body.images
        }
      });
    } catch (error) {
      next(error);
    }
  }
);
```

## Handling Uploads in Routes

Here's an example of how to handle file uploads in a blog post route:

```javascript
const { handleUpload } = require('../services/upload');
const fileService = require('../services/upload/fileService');

router.post('/posts', 
  handleUpload('featuredImage'),
  async (req, res, next) => {
    try {
      const postData = {
        ...req.body,
        // The uploaded file URL is available in req.body.featuredImage
        featuredImage: req.body.featuredImage || null
      };

      const post = await Post.create(postData);
      
      res.status(201).json({
        success: true,
        data: post
      });
    } catch (error) {
      // Clean up uploaded file if there's an error
      if (req.file) {
        await fileService.deleteFileByUrl(req.body.featuredImage);
      }
      next(error);
    }
  }
);
```

## File Service Methods

The file service provides several utility methods:

### `deleteFileByUrl(fileUrl)`
Delete a file by its URL.

```javascript
await fileService.deleteFileByUrl('http://example.com/uploads/image.jpg');
```

### `deleteFilesByUrls(urls)`
Delete multiple files by their URLs.

```javascript
await fileService.deleteFilesByUrls([
  'http://example.com/uploads/image1.jpg',
  'http://example.com/uploads/image2.jpg'
]);
```

### `fileExists(fileUrl)`
Check if a file exists.

```javascript
const exists = await fileService.fileExists('http://example.com/uploads/image.jpg');
```

### `getFileDetails(fileUrl)`
Get details about a file.

```javascript
const details = await fileService.getFileDetails('http://example.com/uploads/image.jpg');
// Returns: { path: string, size: number, modified: Date, isFile: boolean, isDirectory: boolean }
```

## Content Block Uploads

For handling file uploads within rich text content blocks:

```javascript
const { processContentUploads, cleanupOrphanedFiles } = require('../middleware/contentUpload');

// In your route
router.post('/posts/:id', 
  handleUpload('featuredImage'),
  processContentUploads,
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      res.locals.originalContent = post.content;
      next();
    } catch (error) {
      next(error);
    }
  },
  cleanupOrphanedFiles,
  async (req, res, next) => {
    try {
      // Update the post with the new content
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { content: req.body.content },
        { new: true }
      );
      
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }
);
```

## Error Handling

The file upload service handles various error cases:
- File size limits
- Invalid file types
- File system errors
- Network errors

Errors are passed to the Express error handling middleware.

## Security Considerations

1. **File Type Validation**: Only allowed file types are accepted.
2. **File Size Limits**: Limits are enforced to prevent DoS attacks.
3. **File Naming**: Unique filenames are generated to prevent overwrites.
4. **File Deletion**: Old files are automatically cleaned up.
5. **Temporary Files**: Temporary files are cleaned up after 24 hours.

## Configuration

You can configure the file upload service by setting the following environment variables:

```env
# Base URL for file URLs
BASE_URL=http://localhost:3000

# File size limits (in bytes)
MAX_FILE_SIZE=10485760  # 10MB
MAX_IMAGE_SIZE=5242880  # 5MB

# Allowed file types
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

## Best Practices

1. Always validate file types on the client and server.
2. Set appropriate file size limits.
3. Use unique filenames to prevent conflicts.
4. Clean up unused files.
5. Use HTTPS for file uploads in production.
6. Consider using a CDN for serving static files in production.
