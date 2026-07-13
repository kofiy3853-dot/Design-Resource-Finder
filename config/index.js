require('dotenv').config();
const { randomBytes } = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in environment. Generated a random ephemeral secret — all existing sessions will be invalidated on restart.');
  console.warn('  Set JWT_SECRET in your .env file for persistent sessions.');
}
const jwtSecret = JWT_SECRET || randomBytes(64).toString('hex');

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'],
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
};
