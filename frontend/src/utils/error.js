/**
 * Utility functions for error handling
 */

/**
 * Error types
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network error occurred. Please check your connection.',
  [ERROR_TYPES.AUTH]: 'Authentication error. Please log in again.',
  [ERROR_TYPES.VALIDATION]: 'Validation error. Please check your input.',
  [ERROR_TYPES.PERMISSION]: 'Permission denied. You do not have access to this resource.',
  [ERROR_TYPES.NOT_FOUND]: 'Resource not found.',
  [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.CLIENT]: 'Client error occurred. Please check your input.',
  [ERROR_TYPES.UNKNOWN]: 'An unknown error occurred. Please try again.'
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(type, message, details = null) {
    super(message || ERROR_MESSAGES[type]);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Create error object
 * @param {string} type - Error type
 * @param {string} message - Error message
 * @param {any} details - Error details
 * @returns {AppError} Error object
 */
export const createError = (type, message, details = null) => {
  return new AppError(type, message, details);
};

/**
 * Handle API error
 * @param {Error} error - Error object
 * @returns {AppError} Formatted error
 */
export const handleApiError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return createError(ERROR_TYPES.VALIDATION, data.message, data.errors);
      case 401:
        return createError(ERROR_TYPES.AUTH, 'Please log in again');
      case 403:
        return createError(ERROR_TYPES.PERMISSION, 'You do not have permission to perform this action');
      case 404:
        return createError(ERROR_TYPES.NOT_FOUND, 'Resource not found');
      case 500:
        return createError(ERROR_TYPES.SERVER, 'Server error occurred');
      default:
        return createError(ERROR_TYPES.UNKNOWN, 'An error occurred');
    }
  }

  if (error.request) {
    // Request made but no response
    return createError(ERROR_TYPES.NETWORK, 'No response from server');
  }

  // Request setup error
  return createError(ERROR_TYPES.CLIENT, error.message);
};

/**
 * Handle validation error
 * @param {Object} errors - Validation errors
 * @returns {AppError} Formatted error
 */
export const handleValidationError = (errors) => {
  return createError(
    ERROR_TYPES.VALIDATION,
    'Validation failed',
    errors
  );
};

/**
 * Handle permission error
 * @param {string} message - Error message
 * @returns {AppError} Formatted error
 */
export const handlePermissionError = (message) => {
  return createError(
    ERROR_TYPES.PERMISSION,
    message || 'Permission denied'
  );
};

/**
 * Handle not found error
 * @param {string} message - Error message
 * @returns {AppError} Formatted error
 */
export const handleNotFoundError = (message) => {
  return createError(
    ERROR_TYPES.NOT_FOUND,
    message || 'Resource not found'
  );
};

/**
 * Handle server error
 * @param {string} message - Error message
 * @returns {AppError} Formatted error
 */
export const handleServerError = (message) => {
  return createError(
    ERROR_TYPES.SERVER,
    message || 'Server error occurred'
  );
};

/**
 * Handle client error
 * @param {string} message - Error message
 * @returns {AppError} Formatted error
 */
export const handleClientError = (message) => {
  return createError(
    ERROR_TYPES.CLIENT,
    message || 'Client error occurred'
  );
};

/**
 * Handle unknown error
 * @param {Error} error - Error object
 * @returns {AppError} Formatted error
 */
export const handleUnknownError = (error) => {
  return createError(
    ERROR_TYPES.UNKNOWN,
    error.message || 'An unknown error occurred'
  );
};

/**
 * Log error
 * @param {Error} error - Error to log
 * @param {Object} context - Error context
 */
export const logError = (error, context = {}) => {
  const errorLog = {
    name: error.name,
    message: error.message,
    type: error.type || ERROR_TYPES.UNKNOWN,
    details: error.details,
    timestamp: new Date(),
    context
  };

  console.error('Error:', errorLog);

  // TODO: Send to error tracking service
  // if (process.env.NODE_ENV === 'production') {
  //   errorTrackingService.captureError(errorLog);
  // }
};

/**
 * Format error for display
 * @param {Error} error - Error to format
 * @returns {string} Formatted error message
 */
export const formatError = (error) => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
};

/**
 * Check if error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} Is error retryable
 */
export const isRetryableError = (error) => {
  if (error instanceof AppError) {
    return [
      ERROR_TYPES.NETWORK,
      ERROR_TYPES.SERVER
    ].includes(error.type);
  }

  if (error.response) {
    return [500, 502, 503, 504].includes(error.response.status);
  }

  return false;
};

/**
 * Get error type from status code
 * @param {number} status - HTTP status code
 * @returns {string} Error type
 */
export const getErrorTypeFromStatus = (status) => {
  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTH;
    case 403:
      return ERROR_TYPES.PERMISSION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Get error message from status code
 * @param {number} status - HTTP status code
 * @returns {string} Error message
 */
export const getErrorMessageFromStatus = (status) => {
  return ERROR_MESSAGES[getErrorTypeFromStatus(status)];
};

/**
 * Create error boundary fallback
 * @param {Error} error - Error object
 * @param {Function} resetError - Reset error function
 * @returns {JSX.Element} Error boundary fallback
 */
export const createErrorBoundaryFallback = (error, resetError) => {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{formatError(error)}</p>
      <button onClick={resetError}>Try again</button>
    </div>
  );
}; 