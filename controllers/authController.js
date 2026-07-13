const jwt = require('jsonwebtoken');
const { randomBytes } = require('node:crypto');
const User = require('../models/User');
const config = require('../config');
const pool = require('../config/database');
const { sendPasswordResetEmail } = require('../utils/email');

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

exports.showLogin = (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Sign In', user: null });
};

exports.showRegister = (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('register', { title: 'Create Account', user: null });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const userId = await User.create({ name, email, password });

    await pool.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [
        userId,
        'welcome',
        'Welcome to Design Resource Finder!',
        'Upload your first design to get started with AI-powered analysis.',
      ]
    );

    const token = generateToken({ id: userId, email, role: 'user' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ token, redirect: '/dashboard' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await User.comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token, redirect: '/dashboard' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await User.update(user.id, {
      reset_token: token,
      reset_token_expires: expires,
    });

    await sendPasswordResetEmail(email, token);

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (!rows[0]) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    await User.updatePassword(rows[0].id, password);
    await User.update(rows[0].id, { reset_token: null, reset_token_expires: null });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
