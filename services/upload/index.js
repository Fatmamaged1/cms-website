const { 
  uploadImage, 
  uploadFile, 
  uploadFilePDF,
  handleUpload, 
  handleMultipleUploads 
} = require('./multerConfig');

const fileService = require('./fileService');

module.exports = {
  uploadImage,
  uploadFile,
  uploadFilePDF,
  handleUpload,
  handleMultipleUploads,
  fileService
};
