const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticate(req, res, next) {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authenticateOrDemo(req, res, next) {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

  if (!token) {
    if (req.accepts('html')) {
      return res.redirect('/auth/login');
    }
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (req.accepts('html')) {
      return res.redirect('/auth/login');
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function optionalAuth(req, res, next) {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, config.jwt.secret);
    } catch (_) {
      /* invalid/expired token */
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authenticate, authenticateOrDemo, optionalAuth, requireAdmin };
