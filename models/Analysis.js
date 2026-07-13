const pool = require('../config/database');

const Analysis = {
  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO analyses (user_id, upload_id, title, status, fonts, colors, typography, layout,
        background, shapes, objects, design_style, accessibility, ai_explanation,
        resource_recommendations, prompts, recreation_guides, confidence_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.upload_id,
        data.title,
        data.status || 'pending',
        data.fonts ? JSON.stringify(data.fonts) : null,
        data.colors ? JSON.stringify(data.colors) : null,
        data.typography ? JSON.stringify(data.typography) : null,
        data.layout ? JSON.stringify(data.layout) : null,
        data.background ? JSON.stringify(data.background) : null,
        data.shapes ? JSON.stringify(data.shapes) : null,
        data.objects ? JSON.stringify(data.objects) : null,
        data.design_style ? JSON.stringify(data.design_style) : null,
        data.accessibility ? JSON.stringify(data.accessibility) : null,
        data.ai_explanation || null,
        data.resource_recommendations ? JSON.stringify(data.resource_recommendations) : null,
        data.prompts ? JSON.stringify(data.prompts) : null,
        data.recreation_guides ? JSON.stringify(data.recreation_guides) : null,
        data.confidence_score || null,
      ]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM analyses WHERE id = ?', [id]);
    if (!rows[0]) return null;
    return parseJsonFields(rows[0]);
  },

  async findByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT a.*, u.original_name, u.filename
       FROM analyses a
       LEFT JOIN uploads u ON a.upload_id = u.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    const [{ count }] = await pool.query(
      'SELECT COUNT(*) as count FROM analyses WHERE user_id = ?',
      [userId]
    );
    return { analyses: rows.map(parseJsonFields), total: count, page, limit };
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(val && typeof val === 'object' ? JSON.stringify(val) : val);
      }
    }
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE analyses SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async search(userId, query) {
    const [rows] = await pool.query(
      `SELECT a.*, u.original_name, u.filename
       FROM analyses a
       LEFT JOIN uploads u ON a.upload_id = u.id
       WHERE a.user_id = ? AND (
         a.title LIKE ? OR
         JSON_SEARCH(a.fonts, 'one', ?) IS NOT NULL OR
         JSON_SEARCH(a.colors, 'one', ?) IS NOT NULL OR
         JSON_SEARCH(a.design_style, 'one', ?) IS NOT NULL
       )
       ORDER BY a.created_at DESC`,
      [userId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows.map(parseJsonFields);
  },
};

function parseJsonFields(row) {
  if (!row) return row;
  const jsonFields = [
    'fonts',
    'colors',
    'typography',
    'layout',
    'background',
    'shapes',
    'objects',
    'design_style',
    'accessibility',
    'resource_recommendations',
    'prompts',
    'recreation_guides',
  ];
  for (const field of jsonFields) {
    if (typeof row[field] === 'string') {
      try {
        row[field] = JSON.parse(row[field]);
      } catch (_) {
        /* not valid JSON */
      }
    }
  }
  return row;
}

module.exports = Analysis;
