const PageService = require('../services/pageService');

exports.getHomePage = async (req, res, next) => {
  try {
    const data = await PageService.getHomePage(req.language);
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// controllers/homeController.js
exports.updateHomePage = async (req, res, next) => {
  try {
    const updatedPage = await PageService.updateHomePage(req.language, req.body, req.files, req);
    console.log(updatedPage);
    console.log(req.body);
    console.log(req.files);
    res.status(200).json({
      status: 'success',
      message: 'Home page updated successfully',
      data: updatedPage
    });
  } catch (error) {
    next(error);
  }
};

exports.getPageByType = async (req, res, next) => {
  try {
    const page = await PageService.getPageByType(req.params.pageType, req.language);
    res.json({ status: 'success', data: page });
  } catch (error) {
    next(error);
  }
};

exports.getPageById = async (req, res, next) => {
  try {
    const page = await PageService.getPageById(req.params.id, req.language);
    res.json({ status: 'success', data: page });
  } catch (error) {
    next(error);
  }
};

exports.deactivatePage = async (req, res, next) => {
  try {
    await PageService.deactivatePage(req.params.id);
    res.json({ status: 'success', message: 'Page deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
