const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  async create({ name, email, password }) {
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, avatar, role, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async updatePassword(id, password) {
    const hashed = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
  },

  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      'SELECT id, name, email, avatar, role, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [{ count }] = await pool.query('SELECT COUNT(*) as count FROM users');
    return { users: rows, total: count, page, limit };
  },
};

module.exports = User;
