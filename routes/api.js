const { Router } = require('express');
const analysisCtrl = require('../controllers/analysisController');
const reportCtrl = require('../controllers/reportController');
const bgCtrl = require('../controllers/bgGeneratorController');
const { authenticate } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const jobQueue = require('../utils/jobQueue');

const router = Router();

router.get('/analysis/:id/status', authenticate, analysisCtrl.getAnalysisStatus);
router.post('/analysis/trigger', authenticate, analysisCtrl.triggerAnalysis);

// Progress API for real-time updates
router.get('/analysis/:id/progress', authenticate, async (req, res) => {
  try {
    const job = await jobQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    res.json({
      id: job.id,
      status: job.status,
      progress: job.progress || 0,
      currentStep: job.current_step,
      lastError: job.last_error,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    });
  } catch (err) {
    console.error('Progress API error:', err);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

router.get('/analysis/:id/export/json', authenticate, reportCtrl.exportJSON);
router.get('/analysis/:id/export/pdf', authenticate, reportCtrl.exportPDF);

router.get('/saved', authenticate, reportCtrl.getSaved);
router.post('/saved/toggle', authenticate, reportCtrl.toggleSave);

// Background Generator API
router.post('/bg/generate', authenticate, bgCtrl.generateBackground);
router.get('/bg/history', authenticate, bgCtrl.getGeneratedBackgrounds);
router.delete('/bg/:id', authenticate, bgCtrl.deleteBackground);
router.post('/bg/save', authenticate, bgCtrl.saveBackground);

// Serve uploaded files
router.get('/uploads/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM uploads WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    
    const filePath = path.join(__dirname, '..', 'public', rows[0].path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    
    res.sendFile(filePath);
  } catch (err) {
    console.error('Upload serve error:', err);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

module.exports = router;
