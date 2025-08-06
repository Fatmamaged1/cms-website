const fs = require('fs');
const path = require('path');

class FileService {
  constructor() {
    this.baseDir = path.join(process.cwd(), 'public/uploads');
  }

  // Delete a file by URL
  async deleteFileByUrl(fileUrl) {
    try {
      if (!fileUrl) return true;
      
      // Extract the relative path from the URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const relativePath = fileUrl.replace(baseUrl, '');
      
      if (!relativePath) return false;
      
      const filePath = path.join(process.cwd(), 'public', relativePath);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Delete multiple files by URLs
  async deleteFilesByUrls(urls = []) {
    try {
      if (!Array.isArray(urls) || urls.length === 0) return true;
      
      const results = await Promise.all(
        urls.map(url => this.deleteFileByUrl(url))
      );
      
      return results.every(result => result === true);
    } catch (error) {
      console.error('Error deleting files:', error);
      return false;
    }
  }

  // Check if a file exists by URL
  fileExists(fileUrl) {
    if (!fileUrl) return false;
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const relativePath = fileUrl.replace(baseUrl, '');
    
    if (!relativePath) return false;
    
    const filePath = path.join(process.cwd(), 'public', relativePath);
    return fs.existsSync(filePath);
  }

  // Get file details
  getFileDetails(fileUrl) {
    if (!fileUrl) return null;
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const relativePath = fileUrl.replace(baseUrl, '');
    
    if (!relativePath) return null;
    
    const filePath = path.join(process.cwd(), 'public', relativePath);
    
    try {
      const stats = fs.statSync(filePath);
      return {
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error('Error getting file details:', error);
      return null;
    }
  }

  // Clean up temporary files
  async cleanupTempFiles(directory = 'temp', maxAge = 24 * 60 * 60 * 1000) {
    try {
      const tempDir = path.join(this.baseDir, directory);
      
      if (!fs.existsSync(tempDir)) return;
      
      const now = Date.now();
      const files = fs.readdirSync(tempDir);
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        // Delete files older than maxAge
        if (now - stats.mtime.getTime() > maxAge) {
          if (stats.isDirectory()) {
            // Recursively delete directory contents
            await this.cleanupTempFiles(path.join(directory, file), 0);
            fs.rmdirSync(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

// Create a singleton instance
const fileService = new FileService();

// Schedule cleanup of temp files every 24 hours
setInterval(() => {
  fileService.cleanupTempFiles();
}, 24 * 60 * 60 * 1000);

module.exports = fileService;
