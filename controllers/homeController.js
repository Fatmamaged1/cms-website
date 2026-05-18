const PageService = require('../services/pageService');

exports.getHomePage = async (req, res, next) => {
  try {
    // Dashboard requests (authenticated) get all sections including inactive
    // Public requests only get active sections
    const includeInactive = !!req.user;
    const data = await PageService.getHomePage(req.language, { includeInactive });
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// controllers/homeController.js
exports.updateHomePage = async (req, res, next) => {
  try {
    const updatedPage = await PageService.updateHomePage(req.language, req.body, req.files, req);
    res.status(200).json({
      status: 'success',
      message: 'Home page updated successfully',
      data: updatedPage
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    const { sectionKey } = req.params;
    const updatedPage = await PageService.updateSection(req.language, sectionKey, req.body, req.files, req);
    res.status(200).json({
      status: 'success',
      message: `Section "${sectionKey}" updated successfully`,
      data: updatedPage
    });
  } catch (error) {
    next(error);
  }
};

exports.addSection = async (req, res, next) => {
  try {
    const updatedPage = await PageService.addSection(req.language, req.body, req.files, req);
    res.status(201).json({
      status: 'success',
      message: 'Section added successfully',
      data: updatedPage
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const { sectionKey } = req.params;
    const updatedPage = await PageService.deleteSection(req.language, sectionKey);
    res.status(200).json({
      status: 'success',
      message: `Section "${sectionKey}" deleted successfully`,
      data: updatedPage
    });
  } catch (error) {
    next(error);
  }
};

exports.reorderSections = async (req, res, next) => {
  try {
    const { sectionKey, direction } = req.body;
    if (!sectionKey || !direction) {
      return res.status(400).json({ status: 'error', message: 'sectionKey and direction are required' });
    }
    const updatedPage = await PageService.reorderSections(req.language, sectionKey, direction);
    res.status(200).json({
      status: 'success',
      message: `Section "${sectionKey}" moved ${direction}`,
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
