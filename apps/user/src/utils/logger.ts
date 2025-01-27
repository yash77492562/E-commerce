import winston from 'winston';
import path from 'path';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log')
    })
  ]
});

// Add console logging in development
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
  // Add error logging to console in development
  logger.add(new winston.transports.Console({
    level: 'error',
    format: winston.format.simple()
  }));
}

export default logger;
