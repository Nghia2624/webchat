/**
 * Utility functions for logging
 */

/**
 * Log levels
 */
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Log colors
 */
const LOG_COLORS = {
  [LOG_LEVELS.DEBUG]: '#6c757d',
  [LOG_LEVELS.INFO]: '#0dcaf0',
  [LOG_LEVELS.WARN]: '#ffc107',
  [LOG_LEVELS.ERROR]: '#dc3545'
};

/**
 * Log configuration
 */
const config = {
  enabled: process.env.NODE_ENV !== 'production',
  level: LOG_LEVELS.INFO,
  maxLength: 1000,
  groupCollapsed: true
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Log data
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
  }
  
  return `${prefix} ${message}`;
};

/**
 * Log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Log data
 */
const log = (level, message, data = null) => {
  if (!config.enabled) return;
  
  if (LOG_LEVELS[level] < LOG_LEVELS[config.level]) return;
  
  const formattedMessage = formatLogMessage(level, message, data);
  
  if (config.groupCollapsed) {
    console.groupCollapsed(`%c${level}`, `color: ${LOG_COLORS[level]}`);
  } else {
    console.group(`%c${level}`, `color: ${LOG_COLORS[level]}`);
  }
  
  console.log(formattedMessage);
  
  if (data) {
    console.log(data);
  }
  
  console.groupEnd();
};

/**
 * Debug log
 * @param {string} message - Log message
 * @param {any} data - Log data
 */
export const debug = (message, data = null) => {
  log(LOG_LEVELS.DEBUG, message, data);
};

/**
 * Info log
 * @param {string} message - Log message
 * @param {any} data - Log data
 */
export const info = (message, data = null) => {
  log(LOG_LEVELS.INFO, message, data);
};

/**
 * Warn log
 * @param {string} message - Log message
 * @param {any} data - Log data
 */
export const warn = (message, data = null) => {
  log(LOG_LEVELS.WARN, message, data);
};

/**
 * Error log
 * @param {string} message - Log message
 * @param {any} data - Log data
 */
export const error = (message, data = null) => {
  log(LOG_LEVELS.ERROR, message, data);
};

/**
 * Log API request
 * @param {Object} config - Request config
 */
export const logRequest = (config) => {
  debug('API Request', {
    method: config.method,
    url: config.url,
    params: config.params,
    data: config.data
  });
};

/**
 * Log API response
 * @param {Object} response - Response object
 */
export const logResponse = (response) => {
  debug('API Response', {
    status: response.status,
    data: response.data
  });
};

/**
 * Log API error
 * @param {Error} error - Error object
 */
export const logApiError = (error) => {
  error('API Error', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });
};

/**
 * Log WebSocket event
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const logWebSocketEvent = (event, data = null) => {
  debug(`WebSocket Event: ${event}`, data);
};

/**
 * Log WebSocket error
 * @param {Error} error - Error object
 */
export const logWebSocketError = (error) => {
  error('WebSocket Error', {
    message: error.message,
    code: error.code
  });
};

/**
 * Log user action
 * @param {string} action - Action name
 * @param {any} data - Action data
 */
export const logUserAction = (action, data = null) => {
  info(`User Action: ${action}`, data);
};

/**
 * Log performance metric
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 */
export const logPerformance = (name, value) => {
  debug(`Performance: ${name}`, { value });
};

/**
 * Log storage operation
 * @param {string} operation - Operation name
 * @param {any} data - Operation data
 */
export const logStorage = (operation, data = null) => {
  debug(`Storage: ${operation}`, data);
};

/**
 * Log cache operation
 * @param {string} operation - Operation name
 * @param {any} data - Operation data
 */
export const logCache = (operation, data = null) => {
  debug(`Cache: ${operation}`, data);
};

/**
 * Log authentication
 * @param {string} action - Auth action
 * @param {any} data - Auth data
 */
export const logAuth = (action, data = null) => {
  info(`Auth: ${action}`, data);
};

/**
 * Log navigation
 * @param {string} path - Navigation path
 * @param {any} data - Navigation data
 */
export const logNavigation = (path, data = null) => {
  debug(`Navigation: ${path}`, data);
};

/**
 * Log state change
 * @param {string} action - Action name
 * @param {any} prevState - Previous state
 * @param {any} nextState - Next state
 */
export const logStateChange = (action, prevState, nextState) => {
  debug(`State Change: ${action}`, {
    prevState,
    nextState
  });
};

/**
 * Configure logger
 * @param {Object} options - Logger options
 */
export const configureLogger = (options) => {
  Object.assign(config, options);
};

/**
 * Enable logger
 */
export const enableLogger = () => {
  config.enabled = true;
};

/**
 * Disable logger
 */
export const disableLogger = () => {
  config.enabled = false;
};

/**
 * Set log level
 * @param {string} level - Log level
 */
export const setLogLevel = (level) => {
  if (LOG_LEVELS[level]) {
    config.level = level;
  }
}; 