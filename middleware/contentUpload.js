const { handleMultipleUploads, fileService } = require('../services/upload');

/**
 * Middleware to handle content block uploads (for rich text editor)
 * Processes any file uploads in the content blocks and updates the request body
 */
const processContentUploads = (req, res, next) => {
  // If there's no content or blocks, move to the next middleware
  if (!req.body.content || !req.body.content.blocks) {
    return next();
  }

  // Process each block to handle file uploads
  const processBlocks = async (blocks) => {
    const processedBlocks = [];

    for (const block of blocks) {
      // Handle image blocks
      if (block.type === 'image' && block.data && block.data.file) {
        try {
          // Handle the file upload
          const upload = handleMultipleUploads('file', 1);
          
          // Create a mock request/response for the upload middleware
          const mockReq = {
            ...req,
            files: [block.data.file],
            body: {}
          };
          
          const mockRes = {
            status: () => ({
              json: (data) => {
                if (data.success && data.files && data.files.length > 0) {
                  block.data.file = data.files[0];
                }
              }
            })
          };

          await new Promise((resolve) => {
            upload(mockReq, mockRes, resolve);
          });
        } catch (error) {
          console.error('Error processing content upload:', error);
        }
      }
      
      // Recursively process nested blocks
      if (block.blocks && Array.isArray(block.blocks)) {
        block.blocks = await processBlocks(block.blocks);
      }
      
      processedBlocks.push(block);
    }

    return processedBlocks;
  };

  // Process the content blocks
  processBlocks(req.body.content.blocks)
    .then(processedBlocks => {
      req.body.content.blocks = processedBlocks;
      next();
    })
    .catch(error => {
      console.error('Error processing content blocks:', error);
      next(error);
    });
};

/**
 * Middleware to clean up orphaned files when content is updated
 */
const cleanupOrphanedFiles = async (req, res, next) => {
  try {
    const originalContent = res.locals.originalContent; // Should be set by the route handler
    
    if (!originalContent) {
      return next();
    }

    // Extract all file URLs from the original content
    const extractFileUrls = (blocks) => {
      let urls = [];
      
      if (!blocks || !Array.isArray(blocks)) return urls;
      
      blocks.forEach(block => {
        if (block.type === 'image' && block.data && block.data.file) {
          urls.push(block.data.file);
        }
        
        if (block.blocks) {
          urls = [...urls, ...extractFileUrls(block.blocks)];
        }
      });
      
      return urls;
    };

    const originalFileUrls = extractFileUrls(originalContent.blocks);
    const newFileUrls = extractFileUrls(req.body.content?.blocks || []);

    // Find files that were in the original content but not in the new content
    const filesToDelete = originalFileUrls.filter(url => !newFileUrls.includes(url));

    // Delete the orphaned files
    if (filesToDelete.length > 0) {
      await fileService.deleteFilesByUrls(filesToDelete);
    }
    
    next();
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error);
    next(); // Don't fail the request if cleanup fails
  }
};

module.exports = {
  processContentUploads,
  cleanupOrphanedFiles
};
