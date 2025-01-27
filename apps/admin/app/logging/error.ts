
import { createLogger, format, transports, Logger } from 'winston';

// Define the logger configuration
export const logger: Logger = createLogger({
  level: 'error', // Adjust log level as needed (e.g., 'info', 'debug', 'warn', 'error')
  format: format.combine(
    format.timestamp(), // Adds timestamp to each log
    format.printf(({ timestamp, level, message }) => `${timestamp} - ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log' }), // Logs will be saved to this file
    new transports.Console()
  ]
});
