/**
 * AI Controller - Handles AI content generation requests
 */
const aiService = require('../services/aiService');

/**
 * Generate blog content
 * POST /api/v1/ai/generate/blog
 */
exports.generateBlog = async (req, res, next) => {
  try {
    const { prompt, language = 'en' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    const content = await aiService.generateBlogContent(prompt, language);

    res.json({
      success: true,
      message: 'Blog content generated successfully',
      data: content
    });
  } catch (error) {
    console.error('AI Blog Generation Error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    next(error);
  }
};

/**
 * Generate service content
 * POST /api/v1/ai/generate/service
 */
exports.generateService = async (req, res, next) => {
  try {
    const { prompt, language = 'en' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    const content = await aiService.generateServiceContent(prompt, language);

    res.json({
      success: true,
      message: 'Service content generated successfully',
      data: content
    });
  } catch (error) {
    console.error('AI Service Generation Error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    next(error);
  }
};

/**
 * Generate career/job posting content
 * POST /api/v1/ai/generate/career
 */
exports.generateCareer = async (req, res, next) => {
  try {
    const { prompt, language = 'en' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    const content = await aiService.generateCareerContent(prompt, language);

    res.json({
      success: true,
      message: 'Career content generated successfully',
      data: content
    });
  } catch (error) {
    console.error('AI Career Generation Error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    next(error);
  }
};

/**
 * Generate about page content
 * POST /api/v1/ai/generate/about
 */
exports.generateAbout = async (req, res, next) => {
  try {
    const { prompt, language = 'en' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    const content = await aiService.generateAboutContent(prompt, language);

    res.json({
      success: true,
      message: 'About content generated successfully',
      data: content
    });
  } catch (error) {
    console.error('AI About Generation Error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    next(error);
  }
};
