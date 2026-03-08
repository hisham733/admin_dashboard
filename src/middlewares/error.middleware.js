const HttpStatus = require('../enums/http.status.enum');
const httpStatus = require('../enums/http.status.enum'); 
const logger = require('../services/logger.service');

function errorHandler(error, req, res, next) {  
    const statusError = error.status || 500; 
    const label = httpStatus.getLabel(statusError); 
    const message = error.message || httpStatus.getMessage(statusError); 
    
    logger.error(error.stack || error.message);

    const isJsonRequest = req.get('Accept')?.includes('application/json') ||
                          req.get('Content-Type')?.includes('application/json');

    if (isJsonRequest) {
      return res.status(statusError).json({ error: label, message });
    }

    if (statusError === 422) {
      const referrer = req.get('Referrer') || '/';
      const sep = referrer.includes('?') ? '&' : '?';
      return res.redirect(referrer + sep + 'error=' + encodeURIComponent(message));
    }

    return res.status(statusError).render('error/error', {
      status: statusError,
      label,
      message: statusError === 500 ? HttpStatus.getMessage(500) : message
    });
}

module.exports = errorHandler;