const {
  getErrorMessage,
  formatValidationErrors,
  createErrorResponse,
  createSuccessResponse,
  getRecoverySuggestions,
} = require('../utils/errorFormatter');

describe('errorFormatter', () => {
  describe('getErrorMessage', () => {
    it('should return the correct error object for a known code', () => {
      const result = getErrorMessage('INVALID_EMAIL');
      expect(result).toEqual({
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        action: 'Edit',
        code: 'INVALID_EMAIL',
      });
    });

    it('should return SERVER_ERROR for an unknown code', () => {
      const result = getErrorMessage('NONEXISTENT_CODE');
      expect(result).toEqual({
        title: 'Server Error',
        message: 'An unexpected error occurred. Please try again later.',
        action: 'Retry',
        code: 'SERVER_ERROR',
      });
    });

    it('should override the message when customMessage is provided', () => {
      const result = getErrorMessage('UPLOAD_FAILED', 'Custom message');
      expect(result.message).toBe('Custom message');
      expect(result.title).toBe('Upload Failed');
      expect(result.code).toBe('UPLOAD_FAILED');
    });

    it('should return correct object for UPLOAD_FAILED', () => {
      const result = getErrorMessage('UPLOAD_FAILED');
      expect(result).toMatchObject({ title: 'Upload Failed', code: 'UPLOAD_FAILED' });
    });

    it('should return correct object for FILE_TOO_LARGE', () => {
      const result = getErrorMessage('FILE_TOO_LARGE');
      expect(result).toMatchObject({ code: 'FILE_TOO_LARGE' });
      expect(result.message).toContain('10MB');
    });
  });

  describe('formatValidationErrors', () => {
    it('should format Joi errors into structured response', () => {
      const joiError = {
        details: [
          { path: ['email'], message: '"email" is not a valid email' },
          { path: ['password'], message: '"password" is required' },
        ],
      };

      const result = formatValidationErrors(joiError);
      expect(result).toEqual({
        title: 'Validation Failed',
        message: 'Please check your input and try again.',
        errors: {
          email: 'email is not a valid email',
          password: 'password is required',
        },
        code: 'VALIDATION_ERROR',
      });
    });

    it('should handle nested field paths', () => {
      const joiError = {
        details: [{ path: ['user', 'address', 'zip'], message: '"zip" is required' }],
      };
      const result = formatValidationErrors(joiError);
      expect(result.errors['user.address.zip']).toBe('zip is required');
    });
  });

  describe('createErrorResponse', () => {
    it('should create a full error response with all fields', () => {
      const result = createErrorResponse('AUTH_REQUIRED');
      expect(result).toEqual({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          title: 'Authentication Required',
          message: 'Please log in to upload and analyze designs.',
          action: 'Log In',
          details: null,
        },
      });
    });

    it('should include custom message when provided', () => {
      const result = createErrorResponse('NOT_FOUND', 'Custom not found message');
      expect(result.error.message).toBe('Custom not found message');
    });

    it('should include details when provided', () => {
      const details = { field: 'id', value: 42 };
      const result = createErrorResponse('INVALID_INPUT', null, details);
      expect(result.error.details).toEqual(details);
    });

    it('should fall back to SERVER_ERROR for unknown codes', () => {
      const result = createErrorResponse('UNKNOWN');
      expect(result.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('createSuccessResponse', () => {
    it('should create a success response with data and default message', () => {
      const data = { id: 1, name: 'test' };
      const result = createSuccessResponse(data);
      expect(result).toEqual({
        success: true,
        message: 'Operation successful',
        data: { id: 1, name: 'test' },
      });
    });

    it('should use custom message when provided', () => {
      const result = createSuccessResponse([], 'Custom success');
      expect(result.message).toBe('Custom success');
    });

    it('should handle null data', () => {
      const result = createSuccessResponse(null);
      expect(result.data).toBeNull();
      expect(result.success).toBe(true);
    });
  });

  describe('getRecoverySuggestions', () => {
    it('should return suggestions for UPLOAD_FAILED', () => {
      const suggestions = getRecoverySuggestions('UPLOAD_FAILED');
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('10MB');
    });

    it('should return suggestions for NETWORK_ERROR', () => {
      const suggestions = getRecoverySuggestions('NETWORK_ERROR');
      expect(suggestions).toContain('Check your internet connection');
    });

    it('should return suggestions for RATE_LIMIT', () => {
      const suggestions = getRecoverySuggestions('RATE_LIMIT');
      expect(suggestions).toContain('Wait 60 seconds before uploading again');
    });

    it('should return undefined for unknown codes', () => {
      const suggestions = getRecoverySuggestions('NONEXISTENT');
      expect(suggestions).toBeUndefined();
    });
  });
});
