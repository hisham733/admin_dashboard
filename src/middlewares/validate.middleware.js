const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.validationError = errors.array().map(e => e.msg).join('. ');
  }
  next();
}

module.exports = handleValidation;
