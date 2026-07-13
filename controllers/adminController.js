const pool = require('../config/database');
const User = require('../models/User');
const { adminSettingsSchema } = require('../utils/validators');

exports.dashboard = async (req, res) => {
  try {
    const [[userStats]] = await pool.query(
      'SELECT COUNT(*) as total, SUM(is_verified) as verified FROM users'
    );
    const [[analysisStats]] = await pool.query(
      'SELECT COUNT(*) as total, SUM(status = "completed") as completed, SUM(status = "processing") as processing, AVG(confidence_score) as avg_confidence FROM analyses'
    );
    const [[uploadStats]] = await pool.query(
      'SELECT COUNT(*) as total, SUM(size) as total_size FROM uploads'
    );
    const [recentUsers] = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    const [recentAnalyses] = await pool.query(
      `SELECT a.id, a.title, a.status, a.created_at, a.confidence_score, u.name as user_name
       FROM analyses a JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC LIMIT 10`
    );

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: {
        users: userStats,
        analyses: analysisStats,
        uploads: uploadStats,
      },
      recentUsers,
      recentAnalyses,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load admin dashboard',
      user: req.user,
    });
  }
};

exports.users = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { users, total } = await User.getAll(page);
    res.render('admin/users', {
      title: 'User Management',
      user: req.user,
      users,
      total,
      page,
      pages: Math.ceil(total / 20),
    });
  } catch (err) {
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load users', user: req.user });
  }
};

exports.analyses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * 20;
    const [rows] = await pool.query(
      `SELECT a.*, u.name as user_name, u2.original_name
       FROM analyses a JOIN users u ON a.user_id = u.id LEFT JOIN uploads u2 ON a.upload_id = u2.id
       ORDER BY a.created_at DESC LIMIT 20 OFFSET ?`,
      [offset]
    );
    const [{ count }] = await pool.query('SELECT COUNT(*) as count FROM analyses');
    res.render('admin/analyses', {
      title: 'Analysis Management',
      user: req.user,
      analyses: rows,
      total: count,
      page,
      pages: Math.ceil(count / 20),
    });
  } catch (err) {
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load analyses', user: req.user });
  }
};

exports.settings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings');
    res.render('admin/settings', {
      title: 'Site Settings',
      user: req.user,
      settings,
    });
  } catch (err) {
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load settings', user: req.user });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { error: validationError, value } = adminSettingsSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }
    const { key, value: settingValue } = value;
    await pool.query(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, JSON.stringify(settingValue), JSON.stringify(settingValue)]
    );
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

exports.logs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * 50;
    const [rows] = await pool.query(
      `SELECT al.*, u.name as user_name
       FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT 50 OFFSET ?`,
      [offset]
    );
    const [{ count }] = await pool.query('SELECT COUNT(*) as count FROM activity_logs');
    res.render('admin/logs', {
      title: 'Activity Logs',
      user: req.user,
      logs: rows,
      total: count,
      page,
      pages: Math.ceil(count / 50),
    });
  } catch (err) {
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load logs', user: req.user });
  }
};
