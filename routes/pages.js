const { Router } = require('express');
const page = require('../controllers/pageController');
const uploadCtrl = require('../controllers/uploadController');
const { authenticate, authenticateOrDemo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const router = Router();

// Stricter rate limit for uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Upload limit reached. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', page.home);
router.get('/features', page.features);
router.get('/how-it-works', page.howItWorks);
router.get('/showcase', page.showcase);
router.get('/dashboard', authenticateOrDemo, page.dashboardV2);
router.get('/upload', authenticateOrDemo, page.upload);
router.post('/upload', authenticate, uploadLimiter, upload.single('file'), uploadCtrl.uploadFile);
router.get('/history', authenticateOrDemo, page.historyV2);
router.get('/projects', authenticateOrDemo, page.projects);
router.get('/favorites', authenticateOrDemo, page.favorites);
router.get('/resources', authenticateOrDemo, page.resources);
router.get('/bg-generator', authenticateOrDemo, page.bgGenerator);
router.get('/help', page.help);
router.get('/analysis/:id', authenticateOrDemo, page.analysis);
router.get('/learning', page.learning);
router.get('/saved', authenticateOrDemo, page.saved);
router.get('/reports', authenticateOrDemo, page.reports);
router.get('/profile', authenticateOrDemo, page.profile);
router.get('/settings', authenticateOrDemo, page.settings);
router.get('/search', authenticateOrDemo, page.search);
router.get('/achievements', authenticateOrDemo, page.achievements);
router.get('/ai-design-analysis', page.aiDesignAnalysis);
router.get('/faq', page.faq);

module.exports = router;
