import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};
// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'gray',
};
winston.addColors(colors);
// Create format
const format = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());
// Console format with colors
const consoleFormat = winston.format.combine(winston.format.colorize({ all: true }), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
// Create transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.LOG_LEVEL || 'info',
    }),
    // File transport for all logs
    new winston.transports.File({
        filename: path.join(logsDir, 'scraper.log'),
        format,
        level: 'info',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // File transport for errors
    new winston.transports.File({
        filename: path.join(logsDir, 'errors.log'),
        format,
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];
// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false,
});
// Log unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
});
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
// Helper functions for structured logging
export const loggers = {
    scrapeStart: (query, options) => {
        logger.info('Starting scrape', { query, options });
    },
    scrapeComplete: (query, results, duration) => {
        logger.info('Scrape completed', {
            query,
            resultsFound: results,
            durationMs: duration,
        });
    },
    scrapeError: (query, error) => {
        logger.error('Scrape failed', {
            query,
            error: error.message || String(error),
            stack: error.stack,
        });
    },
    apiRequest: (service, endpoint, params) => {
        logger.http('API request', { service, endpoint, params });
    },
    apiResponse: (service, statusCode, duration) => {
        logger.http('API response', {
            service,
            statusCode,
            durationMs: duration,
        });
    },
    apiError: (service, error) => {
        logger.error('API error', {
            service,
            error: error.message || String(error),
            response: error.response?.data,
        });
    },
    storageSuccess: (spiritName, id) => {
        logger.info('Spirit stored successfully', { spiritName, id });
    },
    storageDuplicate: (spiritName, existingId) => {
        logger.warn('Duplicate spirit detected', { spiritName, existingId });
    },
    storageError: (spiritName, error) => {
        logger.error('Storage failed', {
            spiritName,
            error: error.message || String(error),
        });
    },
    validationWarning: (spiritName, warnings) => {
        logger.warn('Validation warnings', { spiritName, warnings });
    },
    rateLimitReached: (service, waitTime) => {
        logger.warn('Rate limit reached', {
            service,
            waitTimeMs: waitTime,
        });
    },
    batchProgress: (completed, total, successRate) => {
        logger.info('Batch processing progress', {
            completed,
            total,
            successRate: `${successRate.toFixed(1)}%`,
        });
    },
};
// Export a function to create child loggers
export function createLogger(module) {
    return logger.child({ module });
}
