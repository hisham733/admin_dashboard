const { body } = require('express-validator');

module.exports = [
  body('email')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail(),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];