const {
  registerSchema,
  loginSchema,
  searchSchema,
  fileUploadSchema,
  validateFile,
  isValidEmail,
  validatePasswordStrength,
} = require('../utils/validators');

describe('validators', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const { error, value } = registerSchema.validate({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('John Doe');
    });

    it('should reject missing name', () => {
      const { error } = registerSchema.validate({
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('should reject name that is too short', () => {
      const { error } = registerSchema.validate({
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(error).toBeDefined();
    });

    it('should reject invalid email', () => {
      const { error } = registerSchema.validate({
        name: 'John',
        email: 'not-an-email',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(error).toBeDefined();
    });

    it('should reject short password', () => {
      const { error } = registerSchema.validate({
        name: 'John',
        email: 'john@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(error).toBeDefined();
    });

    it('should reject mismatched passwords', () => {
      const { error } = registerSchema.validate({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'different',
      });
      expect(error).toBeDefined();
    });

    it('should reject missing email', () => {
      const { error } = registerSchema.validate({
        name: 'John',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(error).toBeDefined();
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const { error } = loginSchema.validate({
        email: 'john@example.com',
        password: 'password123',
      });
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const { error } = loginSchema.validate({
        email: 'bad',
        password: 'password123',
      });
      expect(error).toBeDefined();
    });

    it('should reject missing password', () => {
      const { error } = loginSchema.validate({
        email: 'john@example.com',
      });
      expect(error).toBeDefined();
    });

    it('should reject missing email', () => {
      const { error } = loginSchema.validate({
        password: 'password123',
      });
      expect(error).toBeDefined();
    });
  });

  describe('searchSchema', () => {
    it('should accept valid search query', () => {
      const { error } = searchSchema.validate({
        q: 'modern design',
        color: '#FF5733',
        style: 'modern',
        sortBy: 'recent',
        page: 1,
      });
      expect(error).toBeUndefined();
    });

    it('should accept empty search (all optional)', () => {
      const { error } = searchSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should reject invalid color hex', () => {
      const { error } = searchSchema.validate({ color: 'red' });
      expect(error).toBeDefined();
    });

    it('should reject invalid style', () => {
      const { error } = searchSchema.validate({ style: 'nonexistent' });
      expect(error).toBeDefined();
    });

    it('should reject invalid sortBy', () => {
      const { error } = searchSchema.validate({ sortBy: 'random' });
      expect(error).toBeDefined();
    });

    it('should reject page less than 1', () => {
      const { error } = searchSchema.validate({ page: 0 });
      expect(error).toBeDefined();
    });

    it('should reject non-integer page', () => {
      const { error } = searchSchema.validate({ page: 1.5 });
      expect(error).toBeDefined();
    });
  });

  describe('fileUploadSchema', () => {
    it('should accept valid file metadata', () => {
      const { error } = fileUploadSchema.validate({
        filename: 'image.jpg',
        size: 500000,
        mimetype: 'image/jpeg',
      });
      expect(error).toBeUndefined();
    });

    it('should reject unsupported mimetype', () => {
      const { error } = fileUploadSchema.validate({
        filename: 'file.gif',
        size: 500000,
        mimetype: 'image/gif',
      });
      expect(error).toBeDefined();
    });

    it('should reject oversized file', () => {
      const { error } = fileUploadSchema.validate({
        filename: 'large.jpg',
        size: 20971520,
        mimetype: 'image/jpeg',
      });
      expect(error).toBeDefined();
    });

    it('should reject missing filename', () => {
      const { error } = fileUploadSchema.validate({
        size: 500000,
        mimetype: 'image/jpeg',
      });
      expect(error).toBeDefined();
    });
  });

  describe('validateFile', () => {
    it('should return valid for a valid file', () => {
      const result = validateFile({
        mimetype: 'image/png',
        size: 5000,
      });
      expect(result).toEqual({ valid: true });
    });

    it('should reject when no file provided', () => {
      const result = validateFile(null);
      expect(result).toEqual({ valid: false, error: 'No file uploaded' });
    });

    it('should reject unsupported mimetype', () => {
      const result = validateFile({
        mimetype: 'image/gif',
        size: 5000,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    it('should reject oversized file', () => {
      const result = validateFile({
        mimetype: 'image/jpeg',
        size: 20 * 1024 * 1024,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should score short passwords low', () => {
      const result = validatePasswordStrength('ab1');
      expect(result.score).toBeLessThan(3);
    });

    it('should give feedback for missing requirements', () => {
      const result = validatePasswordStrength('short');
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should return strong for a long complex password', () => {
      const result = validatePasswordStrength('StrongP@ss1!');
      expect(result.level).toBe('strong');
      expect(result.feedback).toEqual([]);
    });

    it('should return weak for lowercase-only password', () => {
      const result = validatePasswordStrength('abcdefgh');
      expect(result.level).toBe('weak');
    });

    it('should suggest uppercase/lowercase mix', () => {
      const result = validatePasswordStrength('lowercaseonly1!');
      expect(result.feedback).toContain('Use both uppercase and lowercase letters');
    });

    it('should suggest including a number', () => {
      const result = validatePasswordStrength('NoNumberHere!');
      expect(result.feedback).toContain('Include at least one number');
    });

    it('should suggest including a special character', () => {
      const result = validatePasswordStrength('NoSpecialChar1');
      expect(result.feedback).toContain('Include at least one special character');
    });

    it('should not give feedback for a strong password', () => {
      const result = validatePasswordStrength('Str0ng!Pass');
      expect(result.feedback).toEqual([]);
    });

    it('should suggest minimum length for short passwords', () => {
      const result = validatePasswordStrength('Aa1!');
      expect(result.feedback).toContain('Password should be at least 8 characters');
    });
  });
});
