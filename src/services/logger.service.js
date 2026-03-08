const winston = require('winston');
const appConfig = require('../configs/app.config');
const path = require('path');

const { combine, timestamp, errors, json } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log')
    })
  ]
});


if (appConfig.ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(timestamp(), json())
  }));
}

module.exports = logger;