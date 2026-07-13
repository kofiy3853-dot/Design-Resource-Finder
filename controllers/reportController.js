const pool = require('../config/database');
const Analysis = require('../models/Analysis');
const pdfGenerator = require('../utils/pdfGenerator');

exports.exportJSON = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ error: 'Not found' });
    if (analysis.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query(
      'INSERT INTO reports (user_id, analysis_id, title, format) VALUES (?, ?, ?, ?)',
      [req.user.id, analysis.id, analysis.title, 'json']
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analysis-${analysis.id}.json"`);
    res.json(analysis);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ error: 'Not found' });
    if (analysis.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pdf = await pdfGenerator.generateAnalysisReport(analysis);

    await pool.query(
      'INSERT INTO reports (user_id, analysis_id, title, format) VALUES (?, ?, ?, ?)',
      [req.user.id, analysis.id, analysis.title, 'pdf']
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="analysis-${analysis.id}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
};

exports.getSaved = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT s.*, a.title as analysis_title
       FROM saved_items s
       LEFT JOIN analyses a ON s.analysis_id = a.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load saved items' });
  }
};

exports.toggleSave = async (req, res) => {
  try {
    const { analysisId } = req.body;
    if (!analysisId) return res.status(400).json({ error: 'analysisId required' });

    const [existing] = await pool.query(
      'SELECT id FROM saved_items WHERE user_id = ? AND analysis_id = ? AND item_type = ?',
      [req.user.id, analysisId, 'analysis']
    );

    if (existing[0]) {
      await pool.query('DELETE FROM saved_items WHERE id = ?', [existing[0].id]);
      res.json({ saved: false });
    } else {
      await pool.query(
        'INSERT INTO saved_items (user_id, analysis_id, item_type) VALUES (?, ?, ?)',
        [req.user.id, analysisId, 'analysis']
      );
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save' });
  }
};
