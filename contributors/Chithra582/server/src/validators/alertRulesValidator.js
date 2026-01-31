const { body, param, query, validationResult } = require('express-validator');

const validateAlertRule = [
  body('daysBefore')
    .isInt({ min: 1, max: 365 })
    .withMessage('daysBefore must be between 1 and 365')
    .toInt(),
  
  body('channels')
    .isArray({ min: 1, max: 4 })
    .withMessage('At least one channel is required (max 4)'),
  
  body('channels.*')
    .isIn(['email', 'in-app', 'push', 'sms'])
    .withMessage('Invalid channel type'),
  
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('enabled must be a boolean')
    .toBoolean(),
  
  body('notificationTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('notificationTime must be in HH:MM format'),
  
  body('timezone')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone must be between 1 and 50 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

const validateUpcomingQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('days must be between 1 and 365')
    .toInt()
    .default(7),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date')
    .toDate(),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date')
    .toDate(),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt()
    .default(1),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt()
    .default(20),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Validate date range if both startDate and endDate are provided
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      
      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate must be before endDate'
        });
      }
    }
    
    next();
  }
];

module.exports = {
  validateAlertRule,
  validateUpcomingQuery
};