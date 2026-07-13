const pool = require('../config/database');

const Collection = {
  async create(userId, name, description = '', color = '#6366f1') {
    try {
      const [result] = await pool.query(
        'INSERT INTO collections (user_id, name, description, color) VALUES (?, ?, ?, ?)',
        [userId, name, description, color]
      );
      return result.insertId;
    } catch (err) {
      console.error('Create collection error:', err);
      return null;
    }
  },

  async getUserCollections(userId) {
    try {
      const [collections] = await pool.query(
        'SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      for (const collection of collections) {
        const [items] = await pool.query(
          'SELECT COUNT(*) as count FROM collection_items WHERE collection_id = ?',
          [collection.id]
        );
        collection.item_count = items[0].count;
      }

      return collections;
    } catch (err) {
      console.error('Get collections error:', err);
      return [];
    }
  },

  async addItem(collectionId, analysisId) {
    try {
      await pool.query(
        'INSERT IGNORE INTO collection_items (collection_id, analysis_id) VALUES (?, ?)',
        [collectionId, analysisId]
      );
      return true;
    } catch (err) {
      console.error('Add item to collection error:', err);
      return false;
    }
  },

  async removeItem(collectionId, analysisId) {
    try {
      await pool.query('DELETE FROM collection_items WHERE collection_id = ? AND analysis_id = ?', [
        collectionId,
        analysisId,
      ]);
      return true;
    } catch (err) {
      console.error('Remove item from collection error:', err);
      return false;
    }
  },

  async getCollectionItems(collectionId) {
    try {
      const [items] = await pool.query(
        `SELECT a.*, ci.added_at, u.filename, u.original_name
         FROM collection_items ci
         JOIN analyses a ON ci.analysis_id = a.id
         LEFT JOIN uploads u ON a.upload_id = u.id
         WHERE ci.collection_id = ?
         ORDER BY ci.added_at DESC`,
        [collectionId]
      );
      return items;
    } catch (err) {
      console.error('Get collection items error:', err);
      return [];
    }
  },

  async deleteCollection(collectionId) {
    try {
      await pool.query('DELETE FROM collection_items WHERE collection_id = ?', [collectionId]);
      await pool.query('DELETE FROM collections WHERE id = ?', [collectionId]);
      return true;
    } catch (err) {
      console.error('Delete collection error:', err);
      return false;
    }
  },

  async updateCollection(collectionId, name, description, color) {
    try {
      await pool.query('UPDATE collections SET name = ?, description = ?, color = ? WHERE id = ?', [
        name,
        description,
        color,
        collectionId,
      ]);
      return true;
    } catch (err) {
      console.error('Update collection error:', err);
      return false;
    }
  },
};

module.exports = Collection;
