const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware to parse JSON strings from FormData fields
 * This is needed because multipart/form-data sends all fields as strings,
 * but validation expects certain fields to be objects/booleans
 * @param {string[]} fields - Array of field names to parse as JSON
 */
const parseFormDataJson = (fields = ['sections', 'seo']) => {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (e) {
          // If parsing fails, leave as string - validation will catch it
        }
      }
    }

    // Also parse isActive as boolean if it's a string
    if (req.body.isActive !== undefined && typeof req.body.isActive === 'string') {
      req.body.isActive = req.body.isActive === 'true';
    }

    next();
  };
};

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    throw new ValidationError('Validation failed', errorMessages);
  }

  next();
};

module.exports = {
  validateRequest,
  parseFormDataJson
};
