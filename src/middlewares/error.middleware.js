const httpStatus = require('../enums/http.status.enum'); 
const logger = require('../services/logger.service');

function errorHandler(error, req, res, next) {  
    const statusError = error.status || 500; 
    const label = httpStatus.getLabel(statusError); 
    const message = error.message || httpStatus.getMessage(statusError); 
    
    //log the error 
    logger.error(error.stack || error.message);

    const isApiRequest = req.path.startsWith('/role') || req.get('Accept')?.includes('application/json');

    if (isApiRequest) {
      return res.status(statusError).json({
        error: label,
        message: message
      });
    }

    if ([404, 401, 403, 500].includes(statusError)) {  
       return res.status(statusError).render('error/error', {
            status: statusError,
            label: label, 
            message: message
       }); 
    }

    if (statusError === 422) {  
      return res.redirect(req.get('Referrer') || '/');
    }

    res.status(statusError).render('error/error', {
        status: statusError,
        label: label, 
        message: message
    });
}

module.exports = errorHandler;