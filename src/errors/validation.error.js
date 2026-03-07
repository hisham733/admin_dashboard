const HttpStatus = require('../enums/http.status.enum'); 

class ValidationError extends Error {  
    constructor(message)  {  
      super(message);  
      this.name = this.constructor.name; 
      this.status = HttpStatus.VALIDATION_ERROR;  
      this.isOperational = true; 

    Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ValidationError; 