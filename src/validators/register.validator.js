const { body } = require('express-validator');

module.exports = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),

  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('confirm_password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];