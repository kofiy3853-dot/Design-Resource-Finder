const Joi = require('joi');

// File upload validation schema
exports.fileUploadSchema = Joi.object({
  filename: Joi.string().max(255).required(),
  size: Joi.number().max(10485760).required(), // 10MB max
  mimetype: Joi.string()
    .valid('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf')
    .required(),
}).unknown(true);

// Analysis metadata validation
exports.analysisSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  description: Joi.string().max(1000).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
}).unknown(true);

// User registration validation
exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
}).unknown(true);

// User login validation
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(true);

// Profile update validation
exports.profileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  bio: Joi.string().max(500).optional(),
  avatar: Joi.string().optional(),
}).unknown(true);

// Search query validation
exports.searchSchema = Joi.object({
  q: Joi.string().max(200).optional(),
  color: Joi.string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  font: Joi.string().max(50).optional(),
  style: Joi.string().valid('minimal', 'modern', 'classic', 'bold', 'other').optional(),
  sortBy: Joi.string().valid('recent', 'confidence', 'relevant').optional(),
  page: Joi.number().integer().min(1).optional(),
}).unknown(true);

// Validation middleware
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body || req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      });
    }

    req.validated = value;
    next();
  };
};

// File validation function
exports.validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file uploaded' };
  }

  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload PNG, JPG, WEBP, SVG, or PDF.',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum file size is 10MB.',
    };
  }

  return { valid: true };
};

// Email validation
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Admin settings update validation
exports.adminSettingsSchema = Joi.object({
  key: Joi.string().min(1).max(100).trim().required(),
  value: Joi.any().required(),
}).unknown(false);

// Password strength validation
exports.validatePasswordStrength = (password) => {
  const strength = {
    score: 0,
    feedback: [],
  };

  if (password.length >= 8) strength.score++;
  else strength.feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) strength.score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    strength.score++;
  } else {
    strength.feedback.push('Use both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    strength.score++;
  } else {
    strength.feedback.push('Include at least one number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength.score++;
  } else {
    strength.feedback.push('Include at least one special character');
  }

  return {
    score: strength.score,
    level: strength.score < 2 ? 'weak' : strength.score < 4 ? 'moderate' : 'strong',
    feedback: strength.feedback,
  };
};
