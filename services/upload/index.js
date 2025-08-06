const { 
  uploadImage, 
  uploadFile, 
  handleUpload, 
  handleMultipleUploads 
} = require('./multerConfig');

const fileService = require('./fileService');

module.exports = {
  uploadImage,
  uploadFile,
  handleUpload,
  handleMultipleUploads,
  fileService
};
