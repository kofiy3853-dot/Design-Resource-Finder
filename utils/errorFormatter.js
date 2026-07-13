/**
 * Error message formatter for consistent user-friendly error messages
 */

const errorMessages = {
  UPLOAD_FAILED: {
    title: 'Upload Failed',
    message: 'Unable to upload file. Please check your file and try again.',
    action: 'Retry',
    code: 'UPLOAD_FAILED',
  },
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'Maximum file size is 10MB. Please compress your image and try again.',
    action: 'Select Another File',
    code: 'FILE_TOO_LARGE',
  },
  UNSUPPORTED_TYPE: {
    title: 'Unsupported Format',
    message: 'Please upload PNG, JPG, WEBP, SVG, or PDF files.',
    action: 'Browse Files',
    code: 'UNSUPPORTED_TYPE',
  },
  NO_FILE_SELECTED: {
    title: 'No File Selected',
    message: 'Please select a file to upload.',
    action: 'Select File',
    code: 'NO_FILE_SELECTED',
  },
  ANALYSIS_FAILED: {
    title: 'Analysis Failed',
    message: 'Unable to analyze the design. Please try again or contact support.',
    action: 'Retry',
    code: 'ANALYSIS_FAILED',
  },
  DATABASE_ERROR: {
    title: 'Database Error',
    message: 'Unable to save your analysis. Please try again later.',
    action: 'Retry',
    code: 'DATABASE_ERROR',
  },
  AUTH_REQUIRED: {
    title: 'Authentication Required',
    message: 'Please log in to upload and analyze designs.',
    action: 'Log In',
    code: 'AUTH_REQUIRED',
  },
  INVALID_INPUT: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    action: 'Edit',
    code: 'INVALID_INPUT',
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Unable to connect. Please check your connection and try again.',
    action: 'Retry',
    code: 'NETWORK_ERROR',
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message: 'You are uploading too fast. Please wait a moment and try again.',
    action: 'Wait',
    code: 'RATE_LIMIT',
  },
  AI_SERVICE_ERROR: {
    title: 'Analysis Service Unavailable',
    message:
      'The AI analysis service is temporarily unavailable. Your image has been saved for later processing.',
    action: 'Dismiss',
    code: 'AI_SERVICE_ERROR',
  },
  INVALID_EMAIL: {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
    action: 'Edit',
    code: 'INVALID_EMAIL',
  },
  WEAK_PASSWORD: {
    title: 'Password Too Weak',
    message:
      'Your password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.',
    action: 'Edit',
    code: 'WEAK_PASSWORD',
  },
  EMAIL_EXISTS: {
    title: 'Email Already Registered',
    message: 'This email is already registered. Please log in or use a different email.',
    action: 'Log In',
    code: 'EMAIL_EXISTS',
  },
  INVALID_CREDENTIALS: {
    title: 'Invalid Credentials',
    message: 'Email or password is incorrect. Please try again.',
    action: 'Retry',
    code: 'INVALID_CREDENTIALS',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    action: 'Log In',
    code: 'SESSION_EXPIRED',
  },
  PERMISSION_DENIED: {
    title: 'Permission Denied',
    message: 'You do not have permission to access this resource.',
    action: 'Go Back',
    code: 'PERMISSION_DENIED',
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The resource you are looking for does not exist.',
    action: 'Go Home',
    code: 'NOT_FOUND',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    action: 'Retry',
    code: 'SERVER_ERROR',
  },
};

/**
 * Get formatted error message by code
 */
exports.getErrorMessage = (code, customMessage = null) => {
  const error = errorMessages[code] || errorMessages['SERVER_ERROR'];

  if (customMessage) {
    error.message = customMessage;
  }

  return error;
};

/**
 * Format validation errors from Joi
 */
exports.formatValidationErrors = (joiError) => {
  const errors = {};

  joiError.details.forEach((detail) => {
    const field = detail.path.join('.');
    errors[field] = detail.message.replace(/"/g, '');
  });

  return {
    title: 'Validation Failed',
    message: 'Please check your input and try again.',
    errors,
    code: 'VALIDATION_ERROR',
  };
};

/**
 * Create error response for API
 */
exports.createErrorResponse = (code, customMessage = null, details = null) => {
  const error = exports.getErrorMessage(code, customMessage);

  return {
    success: false,
    error: {
      code: error.code,
      title: error.title,
      message: error.message,
      action: error.action,
      details: details,
    },
  };
};

/**
 * Create success response for API
 */
exports.createSuccessResponse = (data, message = 'Operation successful') => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Error recovery suggestions based on error code
 */
exports.getRecoverySuggestions = (code) => {
  const suggestions = {
    UPLOAD_FAILED: [
      'Ensure file size is less than 10MB',
      'Check that file format is supported',
      'Try refreshing and uploading again',
    ],
    DATABASE_ERROR: [
      'Check your internet connection',
      'Try again in a few moments',
      'Contact support if problem persists',
    ],
    ANALYSIS_FAILED: [
      'Try uploading a different image',
      'Ensure image is clear and visible',
      'Try again in a few moments',
    ],
    NETWORK_ERROR: [
      'Check your internet connection',
      'Disable VPN if using one',
      'Try a different network',
    ],
    RATE_LIMIT: [
      'Wait 60 seconds before uploading again',
      'Upload files one at a time',
      'Try again later',
    ],
  };

  return suggestions[code] || suggestions['SERVER_ERROR'];
};

module.exports = exports;
